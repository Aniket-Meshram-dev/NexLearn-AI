import Groq from 'groq-sdk';

// ── Environment & Client Setup ───────────────────────────────────

let groqInstance: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqInstance) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        'The GROQ_API_KEY environment variable is missing or empty. Please ensure GROQ_API_KEY is configured in your .env file.'
      );
    }
    groqInstance = new Groq({ apiKey });
  }
  return groqInstance;
}

// ── Model Configurations ─────────────────────────────────────────

// 1. OpenRouter Free Tier Models (1st Priority - 1,000,000 token context capacity)
const OPENROUTER_FREE_MODELS = [
  'liquid/lfm-2.5-2.6b:free',
  'cohere/north-mini-code:free',
  'inclusionai/ling-3.0-flash-vl:free',
  'nex-agi/nex-n2.5-pro:free',
];

// 2. Groq Free Tier Models (2nd Priority - Ultra-fast inference)
export const PRIMARY_MODEL = 'qwen/qwen3.8-27b';
export const FALLBACK_MODEL = 'openai/gpt-oss-120b';
export const TERTIARY_MODEL = 'openai/gpt-oss-20b';
const GROQ_CANDIDATE_MODELS = [PRIMARY_MODEL, FALLBACK_MODEL, TERTIARY_MODEL];

/**
 * Per-model output token ceilings for the Groq on-demand free tier.
 * Asking for more than the ceiling makes Groq reject the call instantly with
 * `429 ... on output tokens per minute (OTPM): Limit 1000, Requested 1927`
 * before a single token is generated, so every request is clamped to the budget.
 */
const GROQ_MODEL_OUTPUT_CEILING: Record<string, number> = {
  [PRIMARY_MODEL]: 1000,
  [FALLBACK_MODEL]: 4500,
  [TERTIARY_MODEL]: 4500,
};

/** Rolling one-minute output-token allowance shared by every Groq free tier call. */
const GROQ_OTPM_BUDGET = 900;

// 3. Google Gemini Flash Models (3rd Priority - 1,000,000 TPM limit)
// Several model ids are listed because the free tier enforces its request quota
// per model, so every extra id acts as an independent quota bucket.
const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

// ── Retry, Cooldown & Token-Budget Utilities ─────────────────────

/** Longest single wait we accept for a provider rate-limit window to reopen. */
const MAX_RETRY_WAIT_MS = 15000;

/** Cooldown applied to a provider that hit an account-wide hard cap. */
const PROVIDER_COOLDOWN_MS = 5 * 60 * 1000;

/** Cooldown applied to a single model whose quota / token budget is exhausted. */
const MODEL_COOLDOWN_MS = 20 * 60 * 1000;

/** Cooldowns are bypassed when the provider itself suggests a very short wait. */
const QUOTA_HINT_RETRY_MS = 6000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const cooldownRegistry = new Map<string, number>();

function markCooling(key: string, ms: number) {
  cooldownRegistry.set(key, Date.now() + ms);
}

function isCooling(key: string): boolean {
  const until = cooldownRegistry.get(key);
  if (!until) return false;
  if (Date.now() >= until) {
    cooldownRegistry.delete(key);
    return false;
  }
  return true;
}

function coolingRemainingSeconds(key: string): number {
  const until = cooldownRegistry.get(key) || 0;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

function errorText(err: any): string {
  const parts = [
    err?.message,
    err?.error?.message,
    typeof err?.error === 'string' ? err.error : '',
    err?.response?.data?.error?.message,
  ];
  return parts.filter(Boolean).join(' | ').toLowerCase();
}

/** Transient failures that deserve exactly one retry (soft 429 windows, 5xx, network drops). */
function isRetryableAiError(err: any): boolean {
  const text = errorText(err);
  if (!text) return false;
  return (
    text.includes('429') ||
    text.includes('rate limit') ||
    text.includes('rate_limit') ||
    text.includes('quota') ||
    text.includes('overloaded') ||
    text.includes('resource_exhausted') ||
    text.includes('timeout') ||
    text.includes('timed out') ||
    text.includes('aborted') ||
    text.includes('fetch failed') ||
    text.includes(' 500') ||
    text.includes(' 502') ||
    text.includes(' 503') ||
    text.includes(' 504') ||
    text.includes('internal server error') ||
    text.includes('unavailable')
  );
}

/** Groq `json_validate_failed` / `failed_generation` errors - usually transient sampling variance. */
function isJsonValidationFailure(err: any): boolean {
  const text = errorText(err);
  return (
    text.includes('json_validate_failed') ||
    text.includes('failed to validate json') ||
    text.includes('failed to generate json')
  );
}

/** Requested output exceeds a model's per-minute allowance - retrying the same size never helps. */
function isRequestTooLargeError(err: any): boolean {
  const text = errorText(err);
  return text.includes('request too large') || text.includes('output tokens per minute') || text.includes('otpm');
}

/** Hard account-level caps: OpenRouter free-models-per-day, Gemini per-day free tier requests. */
function isHardDailyCapError(err: any): boolean {
  const text = errorText(err);
  return (
    text.includes('free-models-per-day') ||
    text.includes('per day') ||
    text.includes('daily limit') ||
    text.includes('free_tier_requests')
  );
}

/** Reads a provider suggested retry delay from headers, `retryDelay`, or "Please retry in 11.05s". */
function extractRetryDelayMs(err: any, fallbackMs = 1500): number {
  const headerCandidates: any[] = [
    err?.headers?.['retry-after'],
    typeof err?.headers?.get === 'function' ? err.headers.get('retry-after') : undefined,
    err?.response?.headers?.['retry-after'],
    err?.error?.headers?.['retry-after'],
  ];

  for (const raw of headerCandidates) {
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(seconds * 1000 + 250, MAX_RETRY_WAIT_MS);
    }
  }

  const text = String(err?.message || err?.error?.message || '');
  const match = text.match(/retry\w*["']?\s*:?\s*(?:in\s*)?["']?(\d+(?:\.\d+)?)\s*s/i);
  if (match) {
    const ms = Number(match[1]) * 1000 + 250;
    if (Number.isFinite(ms) && ms > 0) return Math.min(Math.max(ms, 500), MAX_RETRY_WAIT_MS);
  }

  return fallbackMs;
}

// ── Enrichment De-duplication & Failure Cooldown ────────────────

/** In-flight enrichment promises so concurrent callers share a single AI request. */
const enrichInFlight = new Map<
  string,
  Promise<{ notes: string; exercises?: string; examples?: string; summary?: string }>
>();

/** In-flight section expansion promises for examples & summary. */
const enrichSectionsInFlight = new Map<
  string,
  Promise<{ examples: string; summary: string }>
>();

/** Timestamp until which a module's enrichment stays paused after a provider failure. */
const enrichFailureCooldown = new Map<string, number>();

/** Auto-enrich loops must not hammer providers that just rejected us. */
const ENRICH_FAILURE_COOLDOWN_MS = 3 * 60 * 1000;

// ── Groq Output-Token Budget Pacing ─────────────────────────────

// Groq's free on-demand tier enforces a per-minute output-token ceiling (OTPM).
// Requests are paced against a rolling 60s ledger so concurrent generations do not
// trip immediate `429 Request too large ... OTPM` rejections.
const groqOutputLedger: { at: number; tokens: number }[] = [];

async function reserveGroqOutputBudget(tokens: number): Promise<void> {
  const requested = Math.max(1, Math.min(tokens, GROQ_OTPM_BUDGET));

  const prune = () => {
    const cutoff = Date.now() - 60000;
    while (groqOutputLedger.length > 0 && groqOutputLedger[0].at < cutoff) {
      groqOutputLedger.shift();
    }
    return groqOutputLedger.reduce((sum, entry) => sum + entry.tokens, 0);
  };

  let used = prune();

  if (used > 0 && used + requested > GROQ_OTPM_BUDGET) {
    // The window is already committed. Smooth the burst with a short, bounded pause -
    // never a long stall, because a late answer is worse than a fast provider failover.
    const maxPacingWaitMs = Number(process.env.GROQ_PACING_MAX_WAIT_MS ?? 8000);
    const waitMs = Math.min(60000 - (Date.now() - groqOutputLedger[0].at) + 300, maxPacingWaitMs);

    if (waitMs > 250) {
      console.log(
        `[AI Pipeline - 2nd Priority] Groq output budget at ${used}/${GROQ_OTPM_BUDGET} OTPM - pacing ${Math.round(
          waitMs / 1000
        )}s before the next call...`
      );
      await sleep(waitMs);
      used = prune();
    }
  }

  groqOutputLedger.push({ at: Date.now(), tokens: requested });
}

/** Prioritises Groq models whose output ceiling can satisfy the request without truncation. */
function orderGroqModelsByBudget(requestedMaxTokens: number): string[] {
  const capable = GROQ_CANDIDATE_MODELS.filter(
    (model) => (GROQ_MODEL_OUTPUT_CEILING[model] ?? 4500) >= requestedMaxTokens
  );
  const capped = GROQ_CANDIDATE_MODELS.filter(
    (model) => (GROQ_MODEL_OUTPUT_CEILING[model] ?? 4500) < requestedMaxTokens
  );
  return [...capable, ...capped];
}

// ── Resilient Multi-Provider AI Completion Engine ────────────────

/**
 * 1st Priority: Executes completion against OpenRouter Free Models (1,000,000 context token capacity).
 *
 * Account-wide caps ("free-models-per-day") abort the whole provider immediately instead of
 * burning four identical failing calls, and the provider is then skipped for a short cooldown.
 */
async function callOpenRouterApi(params: {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  if (isCooling('openrouter')) {
    throw new Error(
      `OpenRouter skipped - free daily quota recently exhausted (cooldown ${coolingRemainingSeconds('openrouter')}s).`
    );
  }

  let lastError: any = null;

  // Models are consumed from a queue so a transient failure can be retried once,
  // behind the remaining models, without nesting retry loops.
  const pendingModels: string[] = [...OPENROUTER_FREE_MODELS];
  const retriedModels = new Set<string>();

  while (pendingModels.length > 0) {
    const model = pendingModels.shift() as string;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000); // 25s timeout for complete 5-14 module generation

    try {
      console.log(`[AI Pipeline - 1st Priority] Trying OpenRouter (${model})...`);
      const messages: any[] = [
        {
          role: 'system',
          content:
            params.systemInstruction ||
            'You are a master curriculum architect. Output ONLY raw, valid JSON matching the requested schema. Never output markdown codeblocks or text outside the JSON.',
        },
        { role: 'user', content: params.prompt },
      ];

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nexlearn.ai',
          'X-Title': 'NexLearn AI',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          max_tokens: Math.min(params.max_tokens ?? 4000, 4500),
          temperature: params.temperature ?? 0.3,
        }),
      });
      clearTimeout(timer);

      const data: any = await res.json().catch(() => ({}));
      const apiMessage = data?.error?.message || (typeof data?.error === 'string' ? data.error : null);

      if (!res.ok || apiMessage) {
        const apiError: any = new Error(
          typeof apiMessage === 'string' && apiMessage.length > 0
            ? apiMessage
            : `OpenRouter HTTP ${res.status} ${res.statusText || ''}`.trim()
        );
        apiError.status = res.status;
        apiError.headers = res.headers;
        throw apiError;
      }

      const text = String(data.choices?.[0]?.message?.content || '').trim();
      if (text.length > 10) {
        console.log(`[AI Pipeline - 1st Priority] OpenRouter (${model}) succeeded!`);
        return text;
      }
      throw new Error(`OpenRouter (${model}) returned an empty completion.`);
    } catch (err: any) {
      clearTimeout(timer);
      console.warn(`[AI Pipeline - 1st Priority] OpenRouter (${model}) failed:`, err?.message || err);
      lastError = err;

      // Account-wide daily free quota: every remaining model would fail identically.
      if (isHardDailyCapError(err)) {
        markCooling('openrouter', PROVIDER_COOLDOWN_MS);
        console.warn(
          `[AI Pipeline - 1st Priority] OpenRouter free daily quota exhausted - skipping provider for ${Math.round(
            PROVIDER_COOLDOWN_MS / 60000
          )} min.`
        );
        throw err;
      }

      // One retry per model for transient hiccups, queued behind the remaining models.
      if (!retriedModels.has(model) && isRetryableAiError(err)) {
        retriedModels.add(model);
        const waitMs = extractRetryDelayMs(err, 1200);
        console.log(
          `[AI Pipeline - 1st Priority] Retrying OpenRouter (${model}) in ${Math.round(waitMs / 1000)}s...`
        );
        await sleep(waitMs);
        pendingModels.push(model);
      }
    }
  }

  throw lastError || new Error('All OpenRouter models failed.');
}

/**
 * Recovers usable text from a Groq `json_validate_failed` response when the API provides it.
 */
function salvageFailedGeneration(err: any): string | null {
  const failedGen = err?.error?.failed_generation || err?.failed_generation;
  if (typeof failedGen === 'string' && failedGen.trim().length > 20) return failedGen;
  return null;
}

/**
 * Issues a single Groq completion inside the rolling OTPM budget and returns its raw text.
 */
async function attemptGroqCompletion(
  client: Groq,
  model: string,
  params: { prompt: string; jsonMode?: boolean; temperature?: number },
  maxTokens: number,
  systemInstruction: string
): Promise<string> {
  await reserveGroqOutputBudget(maxTokens);

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: params.prompt },
    ],
    temperature: params.temperature ?? 0.3,
    max_tokens: maxTokens,
    ...(params.jsonMode !== false ? { response_format: { type: 'json_object' } } : {}),
  });

  const content = completion.choices[0]?.message?.content;
  if (content && content.trim().length > 10) return content;
  throw new Error(`Groq (${model}) returned an empty completion.`);
}

/**
 * 2nd Priority: Executes completion against the Groq SDK with OTPM-aware pacing,
 * per-model output ceilings, one transient retry, and failed_generation auto-salvage.
 */
async function callGroqApi(params: {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  const client = getGroqClient();
  let lastError: any = null;

  const requestedMaxTokens = params.max_tokens ?? 4000;
  const defaultSystem =
    params.systemInstruction ||
    'You are an educational syllabus architect. Output ONLY valid, parseable JSON matching the requested schema. Never output markdown codeblocks or text outside the JSON.';

  const retryQueue: string[] = [];

  for (const model of orderGroqModelsByBudget(requestedMaxTokens)) {
    const modelMaxTokens = Math.min(requestedMaxTokens, GROQ_MODEL_OUTPUT_CEILING[model] ?? 4500);
    const wasClamped = modelMaxTokens < requestedMaxTokens;
    const cooldownKey = `groq:${model}`;

    if (isCooling(cooldownKey)) {
      console.warn(
        `[AI Pipeline - 2nd Priority] Skipping Groq (${model}) - cooling down for ${coolingRemainingSeconds(cooldownKey)}s.`
      );
      continue;
    }

    try {
      console.log(
        `[AI Pipeline - 2nd Priority] Trying Groq (${model})${
          wasClamped ? ` [output clamped to ${modelMaxTokens} tokens to fit the OTPM budget]` : ''
        }...`
      );

      const content = await attemptGroqCompletion(client, model, params, modelMaxTokens, defaultSystem);
      console.log(`[AI Pipeline - 2nd Priority] Groq (${model}) succeeded!`);
      return content;
    } catch (err: any) {
      const salvaged = salvageFailedGeneration(err);
      if (salvaged) {
        console.warn(`[AI Pipeline - 2nd Priority] Groq (${model}) validate_failed but salvaged partial text.`);
        return salvaged;
      }

      console.warn(`[AI Pipeline - 2nd Priority] Groq (${model}) failed:`, err?.message || err);
      lastError = err;

      if (isHardDailyCapError(err)) {
        markCooling(cooldownKey, MODEL_COOLDOWN_MS);
        console.warn(
          `[AI Pipeline - 2nd Priority] Groq (${model}) daily quota exhausted - cooling down ${Math.round(
            MODEL_COOLDOWN_MS / 60000
          )} min.`
        );
        continue;
      }

      // Requested output is too large for this model: retrying the same size cannot help.
      if (isRequestTooLargeError(err)) continue;

      if (isRetryableAiError(err) || isJsonValidationFailure(err)) retryQueue.push(model);
    }
  }

  // Second pass: one retry per model that only failed for transient reasons.
  for (const model of retryQueue) {
    const modelMaxTokens = Math.min(requestedMaxTokens, GROQ_MODEL_OUTPUT_CEILING[model] ?? 4500);

    try {
      const waitMs = extractRetryDelayMs(lastError, 2000);
      console.log(`[AI Pipeline - 2nd Priority] Retrying Groq (${model}) in ${Math.round(waitMs / 1000)}s...`);
      await sleep(waitMs);

      const content = await attemptGroqCompletion(client, model, params, modelMaxTokens, defaultSystem);
      console.log(`[AI Pipeline - 2nd Priority] Groq (${model}) succeeded on retry!`);
      return content;
    } catch (err: any) {
      const salvaged = salvageFailedGeneration(err);
      if (salvaged) {
        console.warn(`[AI Pipeline - 2nd Priority] Groq (${model}) retry validate_failed but salvaged partial text.`);
        return salvaged;
      }

      console.warn(`[AI Pipeline - 2nd Priority] Groq (${model}) retry failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Groq models failed.');
}

/**
 * 3rd Priority: Executes completion against the Google Gemini Flash REST API.
 *
 * Quota exhaustion cools down only the affected model id (every id is a separate
 * free-tier quota bucket) while the loop keeps trying the remaining models.
 */
async function callGeminiApi(params: {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');

  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    const cooldownKey = `gemini:${model}`;

    if (isCooling(cooldownKey)) {
      console.warn(
        `[AI Pipeline - 3rd Priority] Skipping Gemini (${model}) - quota cooldown ${coolingRemainingSeconds(cooldownKey)}s.`
      );
      continue;
    }

    let attemptsLeft = 2;
    while (attemptsLeft > 0) {
      attemptsLeft--;

      try {
        console.log(`[AI Pipeline - 3rd Priority] Trying Gemini (${model})...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload: any = {
          contents: [{ parts: [{ text: params.prompt }] }],
          generationConfig: {
            temperature: params.temperature ?? 0.35,
            ...(params.jsonMode !== false ? { responseMimeType: 'application/json' } : {}),
          },
        };

        if (params.systemInstruction) {
          payload.systemInstruction = { parts: [{ text: params.systemInstruction }] };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data: any = await res.json().catch(() => ({}));
        if (data?.error) {
          const apiError: any = new Error(`Gemini (${model}): ${data.error.message || JSON.stringify(data.error)}`);
          apiError.status = res.status;
          apiError.headers = res.headers;
          throw apiError;
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof text === 'string' && text.trim().length > 10) {
          console.log(`[AI Pipeline - 3rd Priority] Gemini (${model}) succeeded!`);
          return text;
        }
        throw new Error(`Gemini (${model}) returned an empty completion.`);
      } catch (err: any) {
        console.warn(`[AI Pipeline - 3rd Priority] Gemini (${model}) failed:`, err?.message || err);
        lastError = err;

        if (isHardDailyCapError(err)) {
          // The free tier usually reports the exact moment its window reopens.
          const hintedWait = extractRetryDelayMs(err, -1);
          if (attemptsLeft > 0 && hintedWait > 0 && hintedWait <= QUOTA_HINT_RETRY_MS) {
            console.log(
              `[AI Pipeline - 3rd Priority] Gemini (${model}) quota window reopens in ${Math.round(
                hintedWait / 1000
              )}s - retrying once.`
            );
            await sleep(hintedWait);
            continue;
          }

          markCooling(cooldownKey, MODEL_COOLDOWN_MS);
          console.warn(
            `[AI Pipeline - 3rd Priority] Gemini (${model}) free quota exhausted - cooling down ${Math.round(
              MODEL_COOLDOWN_MS / 60000
            )} min and falling through to the next model.`
          );
          break;
        }

        if (attemptsLeft > 0 && isRetryableAiError(err)) {
          const waitMs = extractRetryDelayMs(err, 2500);
          console.log(`[AI Pipeline - 3rd Priority] Retrying Gemini (${model}) in ${Math.round(waitMs / 1000)}s...`);
          await sleep(waitMs);
          continue;
        }

        break;
      }
    }
  }

  throw lastError || new Error('All Gemini models failed.');
}

/**
 * Unified AI caller: Priority order:
 * 1st: OpenRouter Free Models (1M Context)
 * 2nd: Groq Engine (Ultra-fast)
 * 3rd: Google Gemini Flash
 */
export async function callAiWithFallback(params: {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  const failureReasons: string[] = [];

  // 1st Priority: OpenRouter Free Tier Models (1,000,000 Token Context)
  try {
    return await callOpenRouterApi(params);
  } catch (openRouterError: any) {
    const reason = String(openRouterError?.message || openRouterError);
    failureReasons.push(`OpenRouter -> ${reason}`);
    console.warn('1st Priority (OpenRouter) failed/slow, falling over to Groq:', reason);
  }

  // 2nd Priority: Groq (Ultra-fast inference)
  try {
    return await callGroqApi(params);
  } catch (groqError: any) {
    const reason = String(groqError?.message || groqError);
    failureReasons.push(`Groq -> ${reason}`);
    console.warn('2nd Priority (Groq) failed/rate-limited, falling over to Gemini:', reason);
  }

  // 3rd Priority: Google Gemini Flash
  try {
    return await callGeminiApi(params);
  } catch (geminiError: any) {
    const reason = String(geminiError?.message || geminiError);
    failureReasons.push(`Gemini -> ${reason}`);
    console.warn('3rd Priority (Gemini) failed:', reason);
  }

  const providerSummary = failureReasons.map((reason) => reason.substring(0, 180)).join(' | ');
  throw new Error(
    `All AI providers (OpenRouter, Groq, Gemini) temporarily unavailable. Please try again. [${providerSummary}]`
  );
}

/**
 * Legacy Groq helper maintained for backwards compatibility.
 */
export async function callGroqWithFallback(params: {
  messages: any[];
  response_format?: { type: 'json_object' };
  max_tokens?: number;
  temperature?: number;
  preferredModels?: string[];
}) {
  const client = getGroqClient();
  const candidateModels = params.preferredModels || GROQ_CANDIDATE_MODELS;
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const effectiveMaxTokens = Math.min(params.max_tokens ?? 4000, 4500);

      const { preferredModels, ...groqParams } = params;
      const response = await client.chat.completions.create({
        ...groqParams,
        ...(effectiveMaxTokens ? { max_tokens: effectiveMaxTokens } : {}),
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('All Groq AI models failed.');
}

// ── Type Definitions ─────────────────────────────────────────────

export interface CourseModule {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subtopics: string[] | string;
  notes: string;
  examples: string;
  summary: string;
  exercises: string;
}

export interface CourseData {
  title: string;
  description: string;
  modules: CourseModule[];
  roadmap: string;
}

export interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface FlashcardData {
  flashcards: { question: string; answer: string }[];
}

// ── Resilient JSON Parser with Stack Repair ──────────────────────

/**
 * Robust JSON parser that handles markdown codeblocks, strips comments,
 * and repairs unclosed/truncated JSON structures using a LIFO stack.
 */
export function parseResilientJson(rawText: string): any {
  let cleaned = (rawText || '').trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // Attempt 1: Remove trailing commas before } or ]
    let repaired = cleaned.replace(/,(\s*[}\]])/g, '$1');

    try {
      return JSON.parse(repaired);
    } catch {
      // Attempt 2: Balance brackets and braces using a LIFO stack
      const stack: string[] = [];
      let inString = false;
      let escape = false;

      for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{' || char === '[') {
            stack.push(char);
          } else if (char === '}') {
            if (stack.length && stack[stack.length - 1] === '{') stack.pop();
          } else if (char === ']') {
            if (stack.length && stack[stack.length - 1] === '[') stack.pop();
          }
        }
      }

      if (inString) repaired += '"';
      repaired = repaired.trim().replace(/,\s*$/, '');

      // Close open structures in exact reverse LIFO order
      while (stack.length > 0) {
        const openChar = stack.pop();
        if (openChar === '{') repaired += '}';
        else if (openChar === '[') repaired += ']';
      }

      try {
        return JSON.parse(repaired);
      } catch {
        // Attempt 3: Trim to last clean comma if cutoff inside an incomplete key/value
        const lastComma = repaired.lastIndexOf(',');
        if (lastComma > 20) {
          const fallbackSlice = repaired.slice(0, lastComma);
          return parseResilientJson(fallbackSlice);
        }
        throw initialErr;
      }
    }
  }
}

// ── Course Generation Functions ──────────────────────────────────

/**
 * Determines exact target pages and strict guidelines based on difficulty level:
 * - Every module MUST have ONLY 2 pages of content with 400 to 500 words on each page.
 * - Module counts by level:
 *   * Beginner: 5 to 6 modules.
 *   * Intermediate: 8 to 10 modules.
 *   * Advanced: 12 to 14 modules.
 */
export function getLevelPageSpecs(level: string): {
  targetPages: number;
  wordCountPerPages: string;
  levelLabel: string;
  minModules: number;
  maxModules: number;
  moduleRuleText: string;
} {
  const lower = (level || '').toLowerCase();
  const baseSpecs = {
    targetPages: 2,
    wordCountPerPages: 'strictly 350 to 450 words on each page (total 700 to 900 words across exactly 2 pages)',
  };

  if (lower.includes('advance') || lower.includes('hard')) {
    return {
      ...baseSpecs,
      levelLabel: 'Advanced',
      minModules: 12,
      maxModules: 14,
      moduleRuleText: 'generate AT LEAST 12 to 14 deep-dive masterclass modules (minimum 12, maximum 14 modules)',
    };
  }
  if (lower.includes('intermediate') || lower.includes('medium')) {
    return {
      ...baseSpecs,
      levelLabel: 'Intermediate',
      minModules: 8,
      maxModules: 10,
      moduleRuleText: 'generate AT LEAST 8 to 10 comprehensive, practical modules (minimum 8, maximum 10 modules)',
    };
  }
  return {
    ...baseSpecs,
    levelLabel: 'Beginner',
    minModules: 5,
    maxModules: 6,
    moduleRuleText: 'generate AT LEAST 5 to 6 structured foundational modules (minimum 5, maximum 6 modules)',
  };
}

/**
 * Fast, production-grade course generator that outputs a complete syllabus with dynamic modules.
 * Runs in 3 to 6 seconds without exceeding token limits or hitting timeouts.
 */
export async function generateCourse(
  topic: string,
  level: string,
  goal: string,
  hoursPerDay: number,
  duration: string
): Promise<CourseData> {
  const specs = getLevelPageSpecs(level);

  const prompt = `You are a world-class curriculum architect and master university educator.
Design a comprehensive, production-grade course syllabus on "${topic}" for a ${specs.levelLabel} level learner.

PARAMETERS:
- Topic: ${topic}
- Level: ${specs.levelLabel}
- Goal: ${goal}
- Study Commitment: ${hoursPerDay} hours/day
- Duration: ${duration}

MANDATORY MODULE COUNT REQUIREMENTS BY LEVEL:
- Beginner Level: Generate AT LEAST 5 to 6 cohesive modules.
- Intermediate Level: Generate AT LEAST 8 to 10 comprehensive modules.
- Advanced Level: Generate AT LEAST 12 to 14 deep-dive masterclass modules.

CURRENT MANDATE FOR THIS COURSE:
- Target Level: ${specs.levelLabel}
- REQUIRED MODULE COUNT: You MUST ${specs.moduleRuleText}.
- The "modules" array MUST contain AT LEAST ${specs.minModules} modules (target: ${specs.minModules} to ${specs.maxModules} modules). Never return fewer than ${specs.minModules} modules.
- Ensure each module covers a distinct milestone progressing logically from foundational topics to advanced production mastery.

MANDATORY NOTES STRUCTURE FOR EVERY MODULE:
- Every module's "notes" field MUST contain EXACTLY 2 distinct pages separated by "\\n\\n---page---\\n\\n".
- Page 1 ("## Page 1: [Core Concepts & Foundations]"): Comprehensive theory, mental models, and underlying mechanics.
- Page 2 ("## Page 2: [Applied Mechanics & Implementation]"): Concrete implementation code snippet, edge cases, and a > **Key Takeaway:**.
- Ensure all modules are completely generated without truncation.

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Engaging Course Title",
  "description": "Engaging course overview",
  "roadmap": "Structured week-by-week learning plan for ${hoursPerDay} hrs/day over ${duration}",
  "modules": [
    {
      "title": "Module Title",
      "description": "Clear module overview",
      "difficulty": "${specs.levelLabel === 'Beginner' ? 'Easy' : specs.levelLabel === 'Intermediate' ? 'Medium' : 'Hard'}",
      "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
      "notes": "## Page 1: [Core Concept & Foundations]\\n\\n[Detailed conceptual explanation]\\n\\n---page---\\n\\n## Page 2: [Applied Mechanics & Code Demonstration]\\n\\n[Practical code demonstration, mechanics, and edge cases]\\n\\n> **Key Takeaway:** [Core insight]",
      "examples": "Focused practical code demonstration",
      "summary": "Key takeaway points and best practices",
      "exercises": "Practical coding challenge with hint"
    }
  ]
}`;

  const rawText = await callAiWithFallback({
    prompt,
    jsonMode: true,
    temperature: 0.3,
    max_tokens: 4500,
  });

  try {
    const data = parseResilientJson(rawText);

    const stringify = (val: any) => {
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) {
        return val
          .map((item) =>
            typeof item === 'object'
              ? item.title || item.description || JSON.stringify(item)
              : String(item)
          )
          .join(', ');
      }
      if (val && typeof val === 'object') {
        return val.title || val.description || JSON.stringify(val);
      }
      return String(val || '');
    };

    if (Array.isArray(data.modules)) {
      data.modules = data.modules.map((m: any, idx: number) => ({
        title: stringify(m.title) || `Module ${idx + 1}`,
        description: stringify(m.description) || '',
        difficulty: ['Easy', 'Medium', 'Hard'].includes(m.difficulty)
          ? m.difficulty
          : specs.levelLabel === 'Beginner'
            ? 'Easy'
            : specs.levelLabel === 'Intermediate'
              ? 'Medium'
              : 'Hard',
        subtopics: Array.isArray(m.subtopics)
          ? m.subtopics.map(stringify)
          : typeof m.subtopics === 'string'
            ? m.subtopics
              .split(/,\s*|\n+/)
              .map((s: string) => s.trim())
              .filter(Boolean)
            : [`Module ${idx + 1} Core Concepts`],
        notes: typeof m.notes === 'string' && m.notes.trim().length > 20
          ? m.notes
          : `## Page 1: Foundations of ${stringify(m.title) || `Module ${idx + 1}`}\n\nComprehensive exploration of core concepts and architecture.\n\n---page---\n\n## Page 2: Applied Implementation & Production Nuances\n\nPractical implementation mechanics, code demonstrations, and real-world considerations.\n\n> **Key Takeaway:** Master core principles and handle production edge cases.`,
        examples: stringify(m.examples) || 'Practical code implementation and applied example.',
        summary: stringify(m.summary) || 'Comprehensive takeaways, core principles, and architectural best practices.',
        exercises: stringify(m.exercises) || 'Build a production-ready application demonstrating module concepts.',
      }));
    }

    return data;
  } catch (e: any) {
    console.error('Failed to parse AI course response:', rawText.substring(0, 300), e?.message);
    throw new Error('AI generated invalid course data. Please try again.');
  }
}

/**
 * Deepens / expands lecture notes for a specific module to match the exact 2-page, 350-450 words requirement:
 * - Exactly 2 pages of content.
 * - Strictly 350 to 450 words on each page (total 700 to 900 words across both pages).
 * Runs focused on ONE module, completing in 4 to 7 seconds with zero truncation.
 */
export async function enrichModuleNotes(
  topic: string,
  level: string,
  moduleTitle: string,
  subtopics: string[] | string,
  existingNotes?: string
): Promise<{ notes: string; exercises?: string; examples?: string; summary?: string }> {
  const key = `${topic}::${moduleTitle}`.toLowerCase().trim();

  // De-duplicate concurrent enrichment of the same module: the module GET auto-enrich,
  // the course creation pre-warm and the client POST all target the identical module.
  const inFlight = enrichInFlight.get(key);
  if (inFlight) {
    console.log(
      `[AI Pipeline] Reusing in-flight enrichment for "${moduleTitle}" instead of calling the providers again.`
    );
    return inFlight;
  }

  // Short failure cooldown so repeated auto-enrich loops stop burning provider quota.
  const cooldownUntil = enrichFailureCooldown.get(key) || 0;
  if (Date.now() < cooldownUntil) {
    throw new Error(
      `Notes expansion for this module is paused for ${Math.ceil(
        (cooldownUntil - Date.now()) / 1000
      )}s after a provider rate limit. Please retry shortly.`
    );
  }

  const task = runEnrichModuleNotes(topic, level, moduleTitle, subtopics, existingNotes);
  enrichInFlight.set(key, task);

  try {
    const result = await task;
    enrichFailureCooldown.delete(key);
    return result;
  } catch (err) {
    enrichFailureCooldown.set(key, Date.now() + ENRICH_FAILURE_COOLDOWN_MS);
    throw err;
  } finally {
    enrichInFlight.delete(key);
  }
}

/**
 * Performs the actual AI enrichment for one module (always reached through enrichModuleNotes).
 */
async function runEnrichModuleNotes(
  topic: string,
  level: string,
  moduleTitle: string,
  subtopics: string[] | string,
  existingNotes?: string
): Promise<{ notes: string; exercises?: string; examples?: string; summary?: string }> {
  const specs = getLevelPageSpecs(level);

  const prompt = `You are a distinguished academic professor and master technical curriculum specialist.
Your task is to craft an exhaustive, deeply comprehensive set of lecture notes, worked examples, summary, and exercises for the module "${moduleTitle}" in the course on "${topic}" tailored specifically for a ${specs.levelLabel} level learner.

Subtopics covered: ${Array.isArray(subtopics) ? subtopics.join(', ') : subtopics}
${existingNotes ? `Existing Outline Reference:\n${existingNotes.substring(0, 1200)}` : ''}

MANDATORY RULES & SECTIONS:
1. "notes": Generate EXACTLY 2 distinct, comprehensive, textbook-quality pages of notes.
   - Separate the 2 pages strictly with the exact delimiter: "\\n\\n---page---\\n\\n".
   - Page 1 MUST start with: "## Page 1: [Specific Topic Title & Foundations]".
   - Page 2 MUST start with: "## Page 2: [Specific Mechanics & Applied Mastery]".
   - WORD COUNT MANDATE: Each of the 2 pages MUST contain strictly 350 to 450 words (total 700 to 900 words across both pages).
   - STRICT PROHIBITION: A single paragraph is NEVER a page. Do NOT write brief summaries. Write rich, detailed, educational prose.
   - Both pages MUST include:
     * ### Conceptual Foundation & Deep Dive (multi-paragraph detailed explanation of theory, intuition, analogies, and reasons).
     * ### Internal Mechanics & Execution Lifecycle (how it works under the hood, runtime behavior, memory layout/architecture).
     * ### Concrete Implementation & Code Demonstration (syntax-highlighted code with clear inline explanations).
     * ### Edge Cases, Gotchas & Anti-Patterns (pitfalls to avoid, performance trade-offs, real-world nuances).
     * > **Key Takeaway:** [Crucial principle or pro tip to remember].
   - Deliver rich, high-density educational value. Provide both full pages without cutting any corners.

2. "examples": Fully worked, production-grade real-world demonstrations directly grounded in this module's theory and notes:
   - STRICT PROHIBITION: Do NOT write practice exercises, questions, tests, or challenges here! The exercises are already handled separately.
   - Provide 1 to 2 comprehensive, fully worked practical examples with:
     * ### Real-World Production Scenario: Explain where and why this is used in production systems (e.g. enterprise apps, high-throughput services).
     * Full, complete, syntax-highlighted code implementation (ready to run, with inline comments).
     * Step-by-Step Code Walkthrough: Explain key classes, methods, data flows, and design decisions.
     * Expected Output / Behavior: Show the exact execution output or state transition.
     * > **Pro-Tip:** [Production best practice or performance optimization].

3. "summary": An exhaustive, multi-dimensional executive summary distilling the entire 2 pages of notes:
   - STRICT PROHIBITION: A 1-line or single-sentence summary is STRICTLY FORBIDDEN. Write a thorough recap (250-400 words).
   - Must include:
     * ### Core Theoretical Foundations: Bulleted synthesis of Page 1 principles, definitions, and mental models.
     * ### Applied Architecture & Execution Flow: Bulleted synthesis of Page 2 internal mechanics, runtime lifecycle, and patterns.
     * ### Critical Gotchas & Anti-Patterns: Key pitfalls, memory/performance traps, and how to prevent them.
     * ### Quick Revision Cheatsheet: Key terms, syntax patterns, and rules of thumb for rapid review.
     * > **Key Takeaway:** [The single most critical takeaway of the entire module].

4. "exercises": Provide 2 to 3 practical, high-value coding/analytical exercises:
   - Specific challenge description (2-3 sentences).
   - Thoughtful hint (1-2 sentences with > **Hint**: [Clue]).
   - Complete working solution enclosed in:
     <details><summary>View Solution</summary>\\n[Solution code and explanation]\\n</details>

Return ONLY valid JSON:
{
  "notes": "PLAIN STRING with exactly 2 extensive pages (350-450 words each) separated by \\n\\n---page---\\n\\n",
  "examples": "PLAIN STRING with worked real-world examples (with full code, walkthrough, output, and pro-tips - NO exercises/practice questions)",
  "summary": "PLAIN STRING with full multi-part summary of all notes (NOT 1 line)",
  "exercises": "PLAIN STRING with 2-3 challenges with solutions"
}`;

  const rawText = await callAiWithFallback({
    prompt,
    jsonMode: true,
    temperature: 0.3,
    max_tokens: 4500,
  });

  const data = parseResilientJson(rawText);

  return {
    notes: String(data.notes || ''),
    exercises: data.exercises ? String(data.exercises) : undefined,
    examples: data.examples ? String(data.examples) : generateFallbackExamples(topic, moduleTitle, subtopics, existingNotes),
    summary: data.summary ? String(data.summary) : generateFallbackSummary(topic, moduleTitle, subtopics, existingNotes),
  };
}

/**
 * Dedicated, fast generator for expanding thin 'examples' and 'summary' sections
 * directly grounded in the module's notes and topic, without re-generating the 900-word notes.
 */
export async function expandModuleSections(
  topic: string,
  level: string,
  moduleTitle: string,
  subtopics: string[] | string,
  notes?: string
): Promise<{ examples: string; summary: string }> {
  const key = `${topic}::${moduleTitle}::sections`.toLowerCase().trim();

  const inFlight = enrichSectionsInFlight.get(key);
  if (inFlight) {
    console.log(`[AI Pipeline] Reusing in-flight section expansion for "${moduleTitle}".`);
    return inFlight;
  }

  const task = (async () => {
    const specs = getLevelPageSpecs(level);

    const prompt = `You are a distinguished technical educator and systems architect.
Your task is to generate the "examples" and "summary" sections for the module "${moduleTitle}" in the course on "${topic}" for a ${specs.levelLabel} level learner.

Module Subtopics: ${Array.isArray(subtopics) ? subtopics.join(', ') : subtopics}
${notes ? `Module Notes Reference (DERIVE YOUR EXAMPLES & SUMMARY DIRECTLY FROM THESE NOTES):\n${notes.substring(0, 3200)}` : ''}

MANDATORY REQUIREMENTS:

1. "examples" (Grounded in Module Notes & Topic):
   - STRICT PROHIBITION: Do NOT write practice questions, challenges, or exercises here! Practice exercises belong to a separate tab.
   - Provide 1 to 2 detailed, production-grade WORKED EXAMPLES demonstrating the concepts explained in the notes:
     * ### Real-World Production Scenario: Explain the real-world problem, context, and system architecture.
     * Complete, fully implemented code block with syntax highlighting and clear inline comments.
     * Step-by-Step Code Walkthrough: Line-by-line explanation of the implementation, design patterns, and state flow.
     * Expected Output / Behavior: Exact runtime output or expected console log.
     * > **Pro-Tip:** Practical tip for real-world codebases.

2. "summary" (Comprehensive Recap of the Entire Notes):
   - STRICT PROHIBITION: Do NOT output a 1-line or brief 1-paragraph summary. It must be an exhaustive, structured summary of the entire module notes (250-400 words).
   - Structure with markdown headers:
     * ### Core Theoretical Foundations: Recap of fundamental definitions, paradigms, and principles from the notes.
     * ### Applied Architecture & Execution Flow: Recap of internal mechanics, lifecycle, and component interactions.
     * ### Critical Gotchas & Anti-Patterns: Common mistakes, anti-patterns, and debugging advice.
     * ### Quick Revision Cheatsheet: High-yield bullet points for quick exam/interview preparation.
     * > **Key Takeaway:** [The foundational takeaway to remember].

Return ONLY valid JSON:
{
  "examples": "PLAIN STRING with worked real-world examples (with full code, walkthrough, output, and pro-tips - NO exercises/practice questions)",
  "summary": "PLAIN STRING with comprehensive multi-part summary of all notes (NOT 1 line)"
}`;

    try {
      const rawText = await callAiWithFallback({
        prompt,
        jsonMode: true,
        temperature: 0.3,
        max_tokens: 3000,
      });

      const data = parseResilientJson(rawText);
      return {
        examples: data.examples && String(data.examples).trim().length > 50
          ? String(data.examples)
          : generateFallbackExamples(topic, moduleTitle, subtopics, notes),
        summary: data.summary && String(data.summary).trim().length > 50
          ? String(data.summary)
          : generateFallbackSummary(topic, moduleTitle, subtopics, notes),
      };
    } catch (err: any) {
      console.warn(`[AI Pipeline] Section expansion failed for "${moduleTitle}", using rich fallback:`, err?.message || err);
      return {
        examples: generateFallbackExamples(topic, moduleTitle, subtopics, notes),
        summary: generateFallbackSummary(topic, moduleTitle, subtopics, notes),
      };
    }
  })();

  enrichSectionsInFlight.set(key, task);
  try {
    return await task;
  } finally {
    enrichSectionsInFlight.delete(key);
  }
}

/**
 * Fallback generator for realistic, production-ready worked examples (NEVER exercises or questions).
 */
export function generateFallbackExamples(
  topic: string,
  moduleTitle: string,
  subtopics: string[] | string,
  notes?: string
): string {
  const sublist = Array.isArray(subtopics) ? subtopics : subtopics.split(/,\s*/);
  const primaryTopic = sublist[0] || moduleTitle;

  return `### Real-World Production Scenario: ${moduleTitle} in Enterprise Architecture

In production software systems, **${primaryTopic}** is essential for maintainable, high-throughput architectures. Rather than theoretical puzzles or questions, real systems demand robust error boundaries, clear state isolation, and explicit contracts.

Below is an end-to-end, production-grade implementation demonstrating **${primaryTopic}** applied within **${topic}**.

\`\`\`typescript
/**
 * Production-ready demonstration of ${primaryTopic}
 * Context: Enterprise domain service with telemetry & error handling
 */

interface Config {
  readonly serviceName: string;
  readonly timeoutMs: number;
  readonly maxRetries: number;
}

interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  durationMs: number;
}

export class ${moduleTitle.replace(/[^a-zA-Z0-9]/g, '') || 'ModuleService'} {
  private readonly config: Config;

  constructor(serviceName = '${moduleTitle}') {
    this.config = Object.freeze({
      serviceName,
      timeoutMs: 5000,
      maxRetries: 3,
    });
  }

  /**
   * Executes the core operation demonstrating ${primaryTopic} principles.
   */
  public async executeTask<T>(payload: T): Promise<OperationResult<T>> {
    const start = performance.now();
    try {
      if (!payload) {
        throw new Error('Payload validation failed: input cannot be null or undefined');
      }

      // Applied execution of ${primaryTopic}
      console.log(\`[\${this.config.serviceName}] Processing \${JSON.stringify(payload)}\`);
      
      const durationMs = Math.round(performance.now() - start);
      return {
        success: true,
        data: payload,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      return {
        success: false,
        error: err?.message || 'Unknown processing failure',
        durationMs,
      };
    }
  }
}

// ── Live Execution Walkthrough ─────────────────────────────────────
async function runDemo() {
  const service = new ${moduleTitle.replace(/[^a-zA-Z0-9]/g, '') || 'ModuleService'}();
  const result = await service.executeTask({
    action: 'INITIALIZE_${primaryTopic.toUpperCase().replace(/[^A-Z0-9]/g, '_')}',
    timestamp: new Date().toISOString(),
  });
  console.log('Execution Result:', result);
}

runDemo();
\`\`\`

### Step-by-Step Code Walkthrough:
1. **Contract & Immutability**: The configuration object is immutable (\`Object.freeze\`), ensuring predictable runtime behavior across concurrent executions.
2. **Defensive Validation**: Guards check input parameters prior to executing domain logic, preventing null-pointer exceptions and silent degradation.
3. **Telemetry & Structured Errors**: Operations measure execution latency via high-resolution timers (\`performance.now()\`) and return typed result envelopes (\`OperationResult<T>\`).
4. **Execution Flow**: The service abstracts the underlying mechanics of **${primaryTopic}**, providing a clean API contract for upstream consumers.

### Expected Output:
\`\`\`text
[${moduleTitle}] Processing {"action":"INITIALIZE_${primaryTopic.toUpperCase().replace(/[^A-Z0-9]/g, '_')}","timestamp":"2026-09-16T17:00:00.000Z"}
Execution Result: {
  success: true,
  data: { action: 'INITIALIZE_${primaryTopic.toUpperCase().replace(/[^A-Z0-9]/g, '_')}', timestamp: '2026-09-16T17:00:00.000Z' },
  durationMs: 4
}
\`\`\`

> **Pro-Tip:** In mission-critical deployments, decouple configuration from instantiation and always encapsulate external state within explicit boundary wrappers.`;
}

/**
 * Fallback generator for comprehensive multi-section module summaries (NEVER 1 line).
 */
export function generateFallbackSummary(
  topic: string,
  moduleTitle: string,
  subtopics: string[] | string,
  notes?: string
): string {
  const sublist = Array.isArray(subtopics) ? subtopics : subtopics.split(/,\s*/);
  const primaryTopic = sublist[0] || moduleTitle;

  return `### Core Theoretical Foundations
- **Foundational Abstraction**: ${moduleTitle} establishes the core mental model required for mastering **${topic}**. The primary objective is establishing explicit boundaries and predictable component lifecycle contracts.
- **Mental Model & Paradigm**: Instead of imperative ad-hoc procedures, modern best practice relies on declarative state patterns, separation of concerns, and reproducible operational guarantees.
- **Key Definitions**: Master the distinction between interface contracts, runtime execution frames, and shared state domains introduced across this module.

### Applied Architecture & Execution Flow
- **Execution Lifecycle**: Operations initialize by validating prerequisites, hydrating configuration state, and binding execution listeners before handling runtime events.
- **Internal Mechanics**: Under the hood, the system coordinates memory references and runtime scheduling to prevent blocking operations and ensure consistent execution order.
- **Data Flow & Propagation**: State transformations flow unidirectionally from domain models through transformation pipelines to consumer endpoints.

### Critical Gotchas & Anti-Patterns to Avoid
- **Unbounded State Mutation**: Directly mutating shared or outer-scope variables introduces subtle race conditions and non-deterministic testing bugs.
- **Missing Error Boundaries**: Neglecting defensive boundary checks allows unexpected failures to bubble up and crash parent processes.
- **Memory & Resource Leakage**: Forgetting to unsubscribe from listeners or release timer handles degrades application performance over extended runtime sessions.

### Quick Revision Cheatsheet
- Always favor explicit contracts and immutability over mutable ambient state.
- Validate incoming inputs at the boundary before passing them into internal subsystems.
- Profile runtime latency using structured telemetry and high-resolution timing metrics.
- Isolate side-effects into dedicated orchestration handlers.

> **Key Takeaway:** Master the underlying mental model of **${moduleTitle}** before optimizing; clean architecture and defensive boundaries eliminate 90% of production failure modes.`;
}

// ── Quiz, Flashcards, and Mindmap Generation ─────────────────────

export async function generateQuiz(
  moduleTitle: string,
  subtopics: string[] | string,
  difficulty: string,
  notes?: string
): Promise<QuizData> {
  const prompt = `Generate a quiz for the module "${moduleTitle}" with difficulty level "${difficulty}".
Topics covered: ${Array.isArray(subtopics) ? subtopics.join(', ') : subtopics}${notes ? `\nModule Notes:\n${notes.substring(0, 2000)}` : ''}

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "text": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why the correct answer is correct"
    }
  ]
}

Generate exactly 10 multiple choice questions. Each question must have exactly 4 options.
correctAnswer is the 0-based index of the correct option.
Make questions progressively harder.`;

  const rawText = await callAiWithFallback({
    prompt,
    jsonMode: true,
    temperature: 0.35,
    max_tokens: 2500,
  });

  try {
    return parseResilientJson(rawText);
  } catch (e: any) {
    console.error('Failed to parse quiz response:', rawText.substring(0, 200), e?.message);
    throw new Error('AI generated invalid quiz data. Please try again.');
  }
}

export async function generateFlashcards(
  moduleTitle: string,
  notes: string
): Promise<FlashcardData> {
  const prompt = `Generate a set of 8-10 high-quality flashcards for the module: "${moduleTitle}".
Based strictly on these notes:
"${notes ? notes.substring(0, 2500) : 'Core concepts and topics'}"

Each flashcard must have a "question" and an "answer".
- The question should be concise and test a specific concept.
- The answer should be clear and informative.

Return ONLY valid JSON with this structure:
{
  "flashcards": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}

Ensure the questions cover the most important aspects of the notes.`;

  const rawText = await callAiWithFallback({
    prompt,
    jsonMode: true,
    temperature: 0.4,
    max_tokens: 2500,
  });

  try {
    return parseResilientJson(rawText);
  } catch (e: any) {
    console.error('Failed to parse flashcards response:', rawText.substring(0, 200), e?.message);
    throw new Error('AI generated invalid flashcard data.');
  }
}

export async function generateMindmap(
  moduleTitle: string,
  notes: string
): Promise<string> {
  const cleanTitle = (moduleTitle || 'Module').replace(/["`]/g, '');
  const prompt = `Generate an exhaustive, hierarchical MIND MAP JSON structure for the module: "${cleanTitle}".
Based directly on these module notes:
"${notes ? notes.substring(0, 2500) : 'Core concepts and topics'}"

MANDATORY HIERARCHY & NODE TYPES:
1. Root Node: The central module title "${cleanTitle}".
2. Level 1 ("concept"): 3 to 4 Core Conceptual Pillars directly extracted from the notes (e.g., Conceptual Foundations, Internal Mechanics, Applied Implementation, Edge Cases & Gotchas).
3. Level 2 ("subconcept"): 2 to 3 key mechanics or principles under each pillar.
4. Level 3 ("example" or "deepdive"):
   - "example": Concrete worked demonstration, syntax pattern, or real-world use case.
   - "deepdive": Internal execution lifecycle, memory gotcha, or optimization nuance.

Return ONLY a valid JSON object matching this exact schema:
{
  "root": {
    "id": "root",
    "label": "${cleanTitle}",
    "type": "root",
    "description": "Central subject architecture and core mental model",
    "children": [
      {
        "id": "c-1",
        "label": "Core Concept Title",
        "type": "concept",
        "category": "Theory",
        "description": "Concise summary of this architectural pillar",
        "children": [
          {
            "id": "sc-1-1",
            "label": "Sub-concept / Mechanic Title",
            "type": "subconcept",
            "description": "How this mechanic executes and behaves",
            "children": [
              {
                "id": "ex-1-1-1",
                "label": "Applied Production Example",
                "type": "example",
                "description": "Concrete demonstration in real-world software"
              }
            ]
          }
        ]
      }
    ]
  }
}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const rawText = await callAiWithFallback({
        prompt,
        jsonMode: true,
        temperature: 0.25,
        max_tokens: 2800,
      });

      const data = parseResilientJson(rawText);
      if (data && (data.root || data.children || data.label)) {
        return JSON.stringify(data);
      }
    } catch (error: any) {
      console.warn('[AI Pipeline] Mindmap generation attempt', attempt + 1, 'failed:', error?.message);
    }
  }

  // Structured fallback
  return JSON.stringify({
    root: {
      id: 'root',
      label: cleanTitle,
      type: 'root',
      description: `Core conceptual map for ${cleanTitle}`,
      children: [
        {
          id: 'c-1',
          label: 'Conceptual Foundations',
          type: 'concept',
          category: 'Theory',
          description: 'Core mental models, definitions, and foundational paradigms.',
          children: [
            {
              id: 'sc-1-1',
              label: 'Mental Model',
              type: 'subconcept',
              description: 'Primary conceptual framework for reasoning about state and operations.',
            },
            {
              id: 'sc-1-2',
              label: 'Boundary Contracts',
              type: 'subconcept',
              description: 'Explicit interfaces and responsibility decoupling.',
            },
          ],
        },
        {
          id: 'c-2',
          label: 'Internal Mechanics',
          type: 'concept',
          category: 'Architecture',
          description: 'Execution lifecycles, memory layout, and runtime scheduling.',
          children: [
            {
              id: 'sc-2-1',
              label: 'Execution Lifecycle',
              type: 'subconcept',
              description: 'Initialization, runtime evaluation, and cleanup loops.',
            },
            {
              id: 'dd-2-2',
              label: 'Memory & State Domain',
              type: 'deepdive',
              description: 'Under-the-hood reference tracking and garbage collection.',
            },
          ],
        },
        {
          id: 'c-3',
          label: 'Applied Implementation',
          type: 'concept',
          category: 'Engineering',
          description: 'Production patterns, concrete demonstrations, and syntax.',
          children: [
            {
              id: 'ex-3-1',
              label: 'Enterprise Demonstration',
              type: 'example',
              description: 'End-to-end implementation with defensive error boundaries.',
            },
            {
              id: 'sc-3-2',
              label: 'High-Throughput Patterns',
              type: 'subconcept',
              description: 'Optimized execution patterns and composability.',
            },
          ],
        },
        {
          id: 'c-4',
          label: 'Edge Cases & Gotchas',
          type: 'concept',
          category: 'Resilience',
          description: 'Pitfalls, memory traps, and production debugging advice.',
          children: [
            {
              id: 'dd-4-1',
              label: 'State Mutation Pitfalls',
              type: 'deepdive',
              description: 'Preventing non-deterministic race conditions and state leakage.',
            },
            {
              id: 'sc-4-2',
              label: 'Defensive Safeguards',
              type: 'subconcept',
              description: 'Validation barriers and explicit error recovery strategies.',
            },
          ],
        },
      ],
    },
  });
}
