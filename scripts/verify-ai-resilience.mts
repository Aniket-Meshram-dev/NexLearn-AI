/**
 * Verification harness for the multi-provider AI resilience layer (src/lib/gemini.ts).
 *
 * Run with:  node scripts/verify-ai-resilience.mts
 *
 * Every provider HTTP call is stubbed, so this harness never consumes real AI quota.
 */
import { callAiWithFallback, enrichModuleNotes, getGroqClient } from '../src/lib/gemini.ts';

process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.GROQ_PACING_MAX_WAIT_MS = '0'; // keep the OTPM burst-smoothing pause out of the test runtime

const results: string[] = [];
let failures = 0;

function check(name: string, ok: boolean, detail = '') {
  if (ok) {
    results.push(`PASS  ${name}${detail ? ` (${detail})` : ''}`);
  } else {
    failures++;
    results.push(`FAIL  ${name}${detail ? ` (${detail})` : ''}`);
  }
}

// ── Provider stubs ───────────────────────────────────────────────

type StubResponse = { ok: boolean; status: number; statusText: string; headers: any; json: () => Promise<any> };

function jsonResponse(status: number, payload: any): StubResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    headers: { get: () => null },
    json: async () => payload,
  };
}

const httpLog: { provider: string; model: string }[] = [];
const groqLog: { model: string; max_tokens: number }[] = [];

let openRouterResponder: () => StubResponse = () =>
  jsonResponse(429, {
    error: {
      message:
        'Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day',
    },
  });

let geminiResponder: (model: string, attempt: number) => StubResponse = () =>
  jsonResponse(200, { candidates: [{ content: { parts: [{ text: '{"notes":"gemini"}' }] } }] });

let groqResponder: (args: any, attempt: number) => Promise<any> = async () => ({
  choices: [{ message: { content: '{"notes":"groq"}' } }],
});

(globalThis as any).fetch = async (input: any, init: any = {}) => {
  const url = String(typeof input === 'string' ? input : input?.url ?? input);
  const body = init?.body ? JSON.parse(String(init.body)) : {};

  if (url.includes('openrouter.ai')) {
    httpLog.push({ provider: 'openrouter', model: body.model });
    return openRouterResponder();
  }

  if (url.includes('generativelanguage.googleapis.com')) {
    const model = /models\/([^:]+):/.exec(url)?.[1] || 'unknown';
    const attempt = httpLog.filter((entry) => entry.provider === 'gemini' && entry.model === model).length + 1;
    httpLog.push({ provider: 'gemini', model });
    return geminiResponder(model, attempt);
  }

  throw new Error(`Unexpected fetch URL: ${url}`);
};

const groqClient: any = getGroqClient();
groqClient.chat = {
  completions: {
    create: async (args: any) => {
      const attempt = groqLog.filter((entry) => entry.model === args.model).length + 1;
      groqLog.push({ model: args.model, max_tokens: args.max_tokens });
      return groqResponder(args, attempt);
    },
  },
};

function groqError(message: string, extra: Record<string, any> = {}) {
  const err: any = new Error(message);
  err.status = 429;
  Object.assign(err, extra);
  return err;
}

const otpmError = (requested: number) =>
  `429 {"error":{"message":"Request too large for model in organization org_test on output tokens per minute (OTPM): Limit 1000, Requested ${requested}.","type":"tokens","code":"rate_limit_exceeded"}}`;

const resetLogs = () => {
  httpLog.length = 0;
  groqLog.length = 0;
};

// ── Scenario A: OpenRouter account cap + Groq ordering / OTPM clamp ──

async function scenarioA() {
  resetLogs();

  groqResponder = async (args) => {
    if (args.model !== 'qwen/qwen3.8-27b') throw groqError(otpmError(args.max_tokens));
    return { choices: [{ message: { content: `{"notes":"ok-${args.max_tokens}"}` } }] };
  };

  const text = await callAiWithFallback({ prompt: 'deep notes', max_tokens: 4200, jsonMode: true });

  const openRouterRequests = httpLog.filter((entry) => entry.provider === 'openrouter').length;
  check(
    'OpenRouter aborts after ONE attempt when the account daily cap is hit',
    openRouterRequests === 1,
    `requests=${openRouterRequests}`
  );

  check(
    'Groq tries the highest output-ceiling model first',
    groqLog[0]?.model === 'openai/gpt-oss-120b',
    `first=${groqLog[0]?.model}`
  );
  check(
    'Groq falls through to the OTPM-limited model last',
    groqLog[groqLog.length - 1]?.model === 'qwen/qwen3.8-27b',
    `last=${groqLog[groqLog.length - 1]?.model}`
  );

  const qwenAttempt = groqLog.find((entry) => entry.model === 'qwen/qwen3.8-27b');
  check(
    'Groq request tokens are clamped to the model OTPM ceiling (4200 -> 1000)',
    qwenAttempt?.max_tokens === 1000,
    `max_tokens=${qwenAttempt?.max_tokens}`
  );
  check('Fallback chain still returned usable content', text.includes('ok-1000'), text);

  // Second call must not probe OpenRouter again while its cooldown is active.
  resetLogs();
  await callAiWithFallback({ prompt: 'deep notes', max_tokens: 4200, jsonMode: true });
  const repeatRequests = httpLog.filter((entry) => entry.provider === 'openrouter').length;
  check('OpenRouter cooldown prevents re-probing a dead provider', repeatRequests === 0, `requests=${repeatRequests}`);
}

// ── Scenario B: Groq json_validate_failed retry with empty failed_generation ──

async function scenarioB() {
  resetLogs();

  groqResponder = async (args, attempt) => {
    if (args.model === 'openai/gpt-oss-120b') {
      if (attempt === 1) {
        const err = groqError(
          '400 {"error":{"message":"Failed to validate JSON. Please adjust your prompt. Please retry in 0.4s.","code":"json_validate_failed","failed_generation":""}}'
        );
        err.error = { code: 'json_validate_failed', failed_generation: '' };
        throw err;
      }
      return { choices: [{ message: { content: '{"notes":"recovered-after-retry"}' } }] };
    }
    throw groqError(otpmError(args.max_tokens));
  };

  const text = await callAiWithFallback({ prompt: 'deep notes', max_tokens: 4200, jsonMode: true });

  const attempts = groqLog.filter((entry) => entry.model === 'openai/gpt-oss-120b').length;
  check('Groq retries a model once after json_validate_failed', attempts === 2, `attempts=${attempts}`);
  check('Retry result is returned to the caller', text.includes('recovered-after-retry'), text);
}

// ── Scenario C: Gemini quota hint honoured with a single retry ──

async function scenarioC() {
  resetLogs();

  groqResponder = async (args) => {
    throw groqError(otpmError(args.max_tokens));
  };

  geminiResponder = (model, attempt) => {
    if (model === 'gemini-3.6-flash' && attempt === 1) {
      return jsonResponse(429, {
        error: {
          code: 429,
          status: 'RESOURCE_EXHAUSTED',
          message:
            'Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.6-flash\nPlease retry in 1.2s.',
        },
      });
    }
    return jsonResponse(200, { candidates: [{ content: { parts: [{ text: '{"notes":"gemini-after-wait"}' }] } }] });
  };

  const text = await callAiWithFallback({ prompt: 'deep notes', max_tokens: 4200, jsonMode: true });

  const geminiAttempts = httpLog.filter(
    (entry) => entry.provider === 'gemini' && entry.model === 'gemini-3.6-flash'
  ).length;
  check('Gemini is retried on the same model when the quota window reopens shortly', geminiAttempts === 2, `attempts=${geminiAttempts}`);
  check('Gemini success after the hinted wait is returned', text.includes('gemini-after-wait'), text);
}

// ── Scenario D: concurrent enrichment de-duplication ──

async function scenarioD() {
  resetLogs();

  groqResponder = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      choices: [
        {
          message: {
            content: JSON.stringify({
              notes: '## Page 1: Dedupe\n\nDeep body\n\n---page---\n\n## Page 2: More\n\nSecond body',
              exercises: 'Exercise set',
            }),
          },
        },
      ],
    };
  };

  const [first, second] = await Promise.all([
    enrichModuleNotes('Concurrency', 'Intermediate', 'Dedupe Module', ['a', 'b']),
    enrichModuleNotes('Concurrency', 'Intermediate', 'Dedupe Module', ['a', 'b']),
  ]);

  check('Concurrent enrichment of the same module issues exactly one AI request', groqLog.length === 1, `groq requests=${groqLog.length}`);
  check(
    'Both concurrent callers receive identical notes',
    first.notes === second.notes && first.notes.includes('---page---'),
    first.notes.slice(0, 30)
  );
}

// ── Scenario E: failure cooldown stops auto-enrich quota burn ──

async function scenarioE() {
  resetLogs();

  groqResponder = async (args) => {
    throw groqError(otpmError(args.max_tokens));
  };

  geminiResponder = (model) =>
    jsonResponse(429, {
      error: {
        code: 429,
        status: 'RESOURCE_EXHAUSTED',
        message: `Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: ${model}`,
      },
    });

  let firstError = '';
  try {
    await enrichModuleNotes('Topic C', 'Beginner', 'Cooldown Module', 'x');
  } catch (err: any) {
    firstError = String(err?.message || err);
  }

  let secondError = '';
  try {
    await enrichModuleNotes('Topic C', 'Beginner', 'Cooldown Module', 'x');
  } catch (err: any) {
    secondError = String(err?.message || err);
  }

  check(
    'Outage error keeps the canonical message and adds provider details',
    firstError.includes('temporarily unavailable') && firstError.includes('Groq ->'),
    firstError.slice(0, 120)
  );
  check('Repeat enrichment right after a failure is short-circuited by cooldown', secondError.includes('paused for'), secondError.slice(0, 90));
}

async function main() {
  const started = Date.now();
  await scenarioA();
  await scenarioB();
  await scenarioC();
  await scenarioD();
  await scenarioE();

  console.log('\n=== AI resilience verification ===');
  results.forEach((line) => console.log(line));
  console.log(
    `\n${results.length - failures}/${results.length} checks passed in ${((Date.now() - started) / 1000).toFixed(1)}s`
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Harness crashed:', err);
  process.exit(2);
});