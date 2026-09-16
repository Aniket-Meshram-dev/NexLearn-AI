import { callGroqWithFallback } from './gemini';
import {
  MentorPersonaId,
  MentorPersona,
  MENTOR_PERSONAS,
  AudioBriefingScript,
} from './mentor-personas';

export type { MentorPersonaId, MentorPersona, AudioBriefingScript };
export { MENTOR_PERSONAS };


/**
 * Generates an audio briefing script from module notes tailored to a specific mentor persona.
 */
export async function generateAudioBriefing(
  moduleTitle: string,
  courseTitle: string,
  notes: string,
  summary: string,
  personaId: MentorPersonaId = 'elena'
): Promise<AudioBriefingScript> {
  const persona = MENTOR_PERSONAS[personaId] || MENTOR_PERSONAS.elena;

  const prompt = `${persona.systemPromptVoice}

You are creating a spoken audio briefing podcast script for a student learning:
- Course: "${courseTitle || 'Intelligent Learning Pathway'}"
- Module Title: "${moduleTitle}"

MODULE CONTENT:
"""
Notes:
${(notes || '').substring(0, 2500)}

Key Summary:
${(summary || '').substring(0, 1000)}
"""

CRITICAL AUDIO SCRIPT RULES:
1. This is written specifically to be HEARD via Text-to-Speech, NOT read.
2. Absolutely NO markdown syntax (no asterisks **, no headers #, no bullet stars, no backticks, no HTML tags, no URLs).
3. Do NOT read code blocks verbatim. Instead, explain the logic conversationally.
4. Total length should be approx 250-350 words (about 1.5 to 2 minutes when spoken).
5. Structure:
   - "intro": 2-3 spoken sentences introducing the briefing and setting the hook in ${persona.name}'s personality.
   - "sections": Exactly 2 or 3 core points. Each point has a simple spoken heading and 3-4 conversational sentences.
   - "takeaways": 2 or 3 short concluding sentences summarizing what to remember.

Return ONLY a valid JSON object with this exact schema (no markdown fences, no extra commentary):
{
  "title": "A short, catchy briefing title",
  "intro": "Warm spoken greeting and overview",
  "sections": [
    {
      "heading": "Spoken Section Name",
      "text": "Conversational explanation text"
    }
  ],
  "takeaways": [
    "First golden takeaway sentence",
    "Second golden takeaway sentence"
  ]
}`;

  let parsed: any = null;

  try {
    const chatCompletion = await callGroqWithFallback({
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 2000,
    });

    let raw = chatCompletion.choices[0]?.message?.content || '';
    raw = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('Groq audio script generation error:', err);
    // Fallback script if LLM call fails
    parsed = {
      title: `${moduleTitle}: Audio Briefing`,
      intro: `Hello and welcome. In this audio briefing, we are breaking down ${moduleTitle} from ${courseTitle}.`,
      sections: [
        {
          heading: 'Core Concept',
          text: `The essential foundation of ${moduleTitle} revolves around mastering its primary mechanics and practical applications. Focus on understanding the relationship between the theoretical fundamentals and real world implementations.`
        },
        {
          heading: 'Practical Application',
          text: `When applying these concepts, look for the trade-offs and patterns that emerge. Consistency and structured experimentation will help cement your understanding.`
        }
      ],
      takeaways: [
        `Understand the core principle behind ${moduleTitle}.`,
        'Apply the patterns iteratively to build lasting mastery.'
      ]
    };
  }

  // Clean and assemble full script
  const intro = (parsed.intro || '').trim();
  const sections = Array.isArray(parsed.sections) ? parsed.sections : [];
  const takeaways = Array.isArray(parsed.takeaways) ? parsed.takeaways : [];

  const scriptParts: string[] = [intro];
  sections.forEach((sec: any) => {
    if (sec.heading) scriptParts.push(sec.heading + '.');
    if (sec.text) scriptParts.push(sec.text);
  });
  if (takeaways.length > 0) {
    scriptParts.push('To wrap up, here are the key takeaways.');
    takeaways.forEach((t: string) => scriptParts.push(t));
  }

  const fullScript = scriptParts.join(' ');

  // Split into natural spoken sentences for synchronized UI captions / subtitles
  const sentenceRegex = /[^.!?]+[.!?]+(\s|$)/g;
  const rawSentences = fullScript.match(sentenceRegex) || [fullScript];
  const sentences = rawSentences
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return {
    title: parsed.title || `${moduleTitle} Briefing`,
    persona: personaId,
    intro,
    sections,
    takeaways,
    fullScript,
    sentences,
  };
}
