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
    const { title, content, provider } = await req.json();

    if (!title?.trim() && !content?.trim()) {
      return NextResponse.json({ error: 'title or content is required' }, { status: 400 });
    }

    const prompt = buildPrompt(title || '', content || '');

    if (provider === 'Gemini') {
      const genAI = getGeminiClient();
      if (!genAI) {
        return NextResponse.json({ error: 'Gemini is not configured' }, { status: 503 });
      }
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const assist = parseAssist(result.response.text());
      if (!assist) return NextResponse.json({ error: 'Could not parse AI response' }, { status: 502 });
      return NextResponse.json(assist);
    }

    // Default / 'Groq'
    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json({ error: 'Groq is not configured' }, { status: 503 });
    }
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 512,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return NextResponse.json({ error: 'No response from Groq' }, { status: 502 });
    const assist = parseAssist(raw);
    if (!assist) return NextResponse.json({ error: 'Could not parse AI response' }, { status: 502 });
    return NextResponse.json(assist);
  } catch (error) {
    console.error('AI Notes Assist Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI assist' }, { status: 500 });
  }
});
