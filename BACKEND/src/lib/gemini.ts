import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateCourse(topic, level, goal, hoursPerDay, duration) {
  let wordCountRange = "300-400";
  const lowerLevel = level.toLowerCase();
  if (lowerLevel.includes('intermediate')) {
    wordCountRange = "500-600";
  } else if (lowerLevel.includes('advance')) {
    wordCountRange = "700-800";
  }

  const prompt = `You are an expert course designer and professional educator. Create a comprehensive, high-quality course on "${topic}" specifically tailored for a ${level} level student.

Contextual Constraints:
- Target Expertise Level: ${level}
- Primary Learning Goal: ${goal}
- Study Commitment: ${hoursPerDay} hours per day
- Total Course Duration: ${duration}

Content Quality Requirements:
1. "notes": Theory explanation only. Do NOT include examples or exercises.
   - STRICT WORD COUNT: MUST be ${wordCountRange} words. Do NOT exceed this.
   - FORMATTING: Use headings (##, ###) and bullet points.
   - DEPTH: Match the ${level} level.
2. "examples": 1-2 real-world demonstrations based on the notes. Keep code snippets short (max 20 lines each).
3. "summary": Bulleted summary of the notes. Max 8 bullet points.
4. "exercises": 3 practice problems only. One sentence per problem. No solutions.

CRITICAL JSON FORMAT RULES:
- ALL fields (notes, examples, summary, exercises, roadmap) MUST be plain STRINGS.
- Do NOT use arrays or objects for notes, examples, summary, exercises, or roadmap.
- Use \n for newlines within strings. Use markdown-style formatting within the strings.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "title": "string",
  "description": "string",
  "modules": [
    {
      "title": "string",
      "description": "string",
      "difficulty": "Easy|Medium|Hard",
      "subtopics": ["string", "string", "string"],
      "notes": "PLAIN STRING ONLY - theory and notes (${wordCountRange} words)",
      "examples": "PLAIN STRING ONLY - real world examples based on the notes",
      "summary": "PLAIN STRING ONLY - summary of the notes",
      "exercises": "PLAIN STRING ONLY - problems to solve independently"
    }
  ],
  "roadmap": "PLAIN STRING ONLY - learning plan for ${hoursPerDay} hours/day over ${duration}"
}

STRICT MODULE COUNT RULE: You MUST generate a MINIMUM of 5 modules and a MAXIMUM of 8 modules. Fewer than 5 modules is NOT acceptable. Ensure the content is cohesive and builds progressively from beginner to advanced concepts.`;

  let chatCompletion;
  try {
    chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      max_tokens: 16000,
      temperature: 0.7
    });
  } catch (error) {
    console.error("Primary model (70B) failed/rate-limited. Falling back to 8B...", error.message);
    chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
      max_tokens: 16000,
      temperature: 0.7
    });
  }

  let text = chatCompletion.choices[0]?.message?.content || "";

  // Clean markdown code block wrappers if present
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const data = JSON.parse(text);

    // Normalize fields that the AI may have generated as arrays/objects instead of strings
    const stringify = (val) => {
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) return val.map(item => typeof item === 'object' ? (item.title || item.description || JSON.stringify(item)) : String(item)).join('\n\n');
      if (typeof val === 'object' && val !== null) return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join('\n');
      return String(val ?? '');
    };

    if (data.modules) {
      data.modules = data.modules.map(m => ({
        ...m,
        notes: stringify(m.notes),
        examples: stringify(m.examples),
        summary: stringify(m.summary),
        exercises: stringify(m.exercises),
      }));
    }
    if (typeof data.roadmap !== 'string') {
      data.roadmap = stringify(data.roadmap);
    }

    // Enforce minimum module count
    if (!data.modules || data.modules.length < 5) {
      console.error(`Only ${data.modules?.length ?? 0} modules generated. Minimum is 5.`);
      throw new Error('The AI generated too few modules. Please try again.');
    }

    return data;
  } catch (e) {
    console.error('Failed to parse Groq response:', text.substring(0, 200));
    throw new Error('AI generated invalid course data. Please try again.');
  }
}

export async function generateQuiz(moduleTitle: string, subtopics: any, difficulty: string, notes?: string) {
  const prompt = `Generate a quiz for the module "${moduleTitle}" with difficulty level "${difficulty}".
Topics covered: ${Array.isArray(subtopics) ? subtopics.join(', ') : subtopics}${notes ? `\nModule Notes:\n${notes.substring(0, 1000)}` : ''}

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
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

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },
    max_tokens: 3000,
    temperature: 0.5
  });

  let text = chatCompletion.choices[0]?.message?.content || "";

  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse quiz response:', text.substring(0, 200));
    throw new Error('AI generated invalid quiz data. Please try again.');
  }
}

export async function generateFlashcards(moduleTitle, notes) {
  const prompt = `Generate a set of 8-10 high-quality flashcards for the module: "${moduleTitle}".
Based strictly on these notes:
"${notes}"

Each flashcard must have a "question" and an "answer".
- The question should be concise and test a specific concept.
- The answer should be clear and informative.

Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "flashcards": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}

Ensure the questions cover the most important aspects of the notes.`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },
    max_tokens: 4000,
    temperature: 0.6
  });

  let text = chatCompletion.choices[0]?.message?.content || "";
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse flashcards response:', text.substring(0, 200));
    throw new Error('AI generated invalid flashcard data.');
  }
}

export async function generateMindmap(moduleTitle, notes) {
  const basePrompt = `Generate a VALID Mermaid.js MINDMAP diagram (use "mindmap" type ONLY) for module "${moduleTitle}":
Notes: "${notes}"

MANDATORY SYNTAX RULES (CRITICAL - VIOLATION WILL FAIL):
- EXACT START: mindmap
- Root node: root(("${moduleTitle}")) - use double parens with title
- Child nodes: parentId-->childId(("Short Label")) OR parentId-->childId["Short Label"]
- ALWAYS use ("round brackets with quotes") OR ["square"] for nodes with spaces/special chars
- Short labels: max 15 chars, hierarchical 3-4 levels max
- Connect with -->
- Proper line ends. No trailing chars.

EXAMPLE:
mindmap
  root(("Neural Networks"))
    root --> basics(("Basics"))
      basics --> activation(("Activation"))
    root --> types(("Types"))
      types --> feedforward(("Feedforward"))
      types --> recurrent(("RNN"))

Return ONLY raw Mermaid code. NO \`\`\`, JSON, explanation. Start with "mindmap".`;

  const attempts = [basePrompt, basePrompt + '\n\nFIX: Make VALID Mermaid syntax only. No parse errors. Copy example structure exactly.'];

  for (let attempt = 0; attempt < attempts.length; attempt++) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: attempts[attempt] }],
        model: 'llama-3.1-8b-instant',
        max_tokens: 1500,
        temperature: 0.1  // Lower for consistency
      });

      let text = chatCompletion.choices[0]?.message?.content || "";
      text = text.replace(/```mermaid\n?/gi, '').replace(/```\n?/gi, '').trim();

      // Basic validation
      if (text.startsWith('mindmap') && text.includes('-->') && text.trim().length > 50 && !text.includes('[N')) {
        console.log('Mindmap generated successfully on attempt', attempt + 1);
        return text;
      } else {
        console.warn('Mindmap validation failed, retrying... Raw:', text.substring(0, 100));
      }
    } catch (error) {
      console.error('Mindmap generation attempt', attempt + 1, 'failed:', error.message);
    }
  }

  // Fallback minimal valid diagram
  console.error('All mindmap attempts failed, returning fallback');
  return `mindmap
  root(("${moduleTitle}"))
    root --> Concepts("Key Concepts")
    root --> Examples("Examples")`;
}
