import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// Same real, distinct models as app/api/ai/generate/route.ts — verified
// against the live Groq API. The previous llama-3.3-70b-versatile was
// deprecated from this account's catalog and 404'd on every single call,
// with no fallback in this route, so AI Assist failed 100% of the time.
const GROQ_MODELS: Record<'deep' | 'fast', string> = {
  deep: 'openai/gpt-oss-120b',
  fast: 'openai/gpt-oss-20b',
};

interface Assist {
  summary: string;
  actionItems: string[];
}

function parseAssist(raw: string): Assist | null {
  try {
    const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.summary !== 'string' || !Array.isArray(parsed.actionItems)) return null;
    return { summary: parsed.summary, actionItems: parsed.actionItems.filter((i: unknown) => typeof i === 'string') };
  } catch {
    return null;
  }
}

const buildPrompt = (title: string, content: string) => `You are summarizing a note for a busy professional.
Note title: ${title}
Note content:
${content}

Respond with ONLY a JSON object (no markdown fences, no prose):
{
  "summary": string (a concise 1-3 sentence summary of the note),
  "actionItems": string[] (a list of concrete action items found in the note; empty array if none)
}`;

export const POST = withMultiTenancy(async (req) => {
  try {
    const { title, content, model } = await req.json();

    if (!title?.trim() && !content?.trim()) {
      return NextResponse.json({ error: 'title or content is required' }, { status: 400 });
    }

    const engine: 'deep' | 'fast' = model === 'fast' ? 'fast' : 'deep';
    const prompt = buildPrompt(title || '', content || '');

    let assist: Assist | null = null;
    let modelUsed: string | undefined;

    const groq = getGroqClient();
    if (groq) {
      try {
        const groqModel = GROQ_MODELS[engine];
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: groqModel,
          temperature: 0.5,
          max_tokens: 512,
        });
        const raw = completion.choices[0]?.message?.content;
        if (raw) {
          assist = parseAssist(raw);
          if (assist) modelUsed = groqModel;
        }
      } catch (groqError: unknown) {
        console.error('[AI Notes] Groq failed:', groqError instanceof Error ? groqError.message : groqError);
      }
    }

    if (!assist) {
      const genAI = getGeminiClient();
      if (genAI) {
        try {
          const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const result = await geminiModel.generateContent(prompt);
          assist = parseAssist(result.response.text());
          if (assist) modelUsed = 'gemini-2.5-flash';
        } catch (geminiError: unknown) {
          console.error('[AI Notes] Gemini failed:', geminiError instanceof Error ? geminiError.message : geminiError);
        }
      }
    }

    if (!assist) {
      return NextResponse.json({ error: 'All AI providers failed. Please try again, or save the note without AI assist.' }, { status: 502 });
    }

    return NextResponse.json({ ...assist, model: modelUsed });
  } catch (error) {
    console.error('AI Notes Assist Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI assist' }, { status: 500 });
  }
});
