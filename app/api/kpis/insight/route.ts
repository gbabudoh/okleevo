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

// Same real, verified-working models used across the app's other AI routes
// (see app/api/ai/generate/route.ts) — llama-3.3-70b-versatile is deprecated
// from this account's Groq catalog and 404s on every call.
const GROQ_MODEL = 'openai/gpt-oss-120b';

const buildPrompt = (name: string, value: string, target: string | undefined, progress: number | undefined, category: string) => `You are a business analyst writing a short insight for an executive KPI dashboard.
Metric: ${name} (${category})
Current value: ${value}
${target ? `Target: ${target}` : ''}
${progress !== undefined ? `Progress toward target: ${progress}%` : ''}

Write a 2-3 sentence analysis of this specific metric: what the current standing suggests, and one concrete, relevant recommendation. Be specific to this metric and category — do not give generic advice that could apply to any KPI. Respond with plain text only, no markdown, no preamble.`;

export const POST = withMultiTenancy(async (req) => {
  try {
    const { name, value, target, progress, category } = await req.json();

    if (!name?.trim() || value === undefined) {
      return NextResponse.json({ error: 'name and value are required' }, { status: 400 });
    }

    const prompt = buildPrompt(name, String(value), target ? String(target) : undefined, progress, category || 'general');

    let insight: string | undefined;
    let modelUsed: string | undefined;

    const groq = getGroqClient();
    if (groq) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: GROQ_MODEL,
          temperature: 0.5,
          max_tokens: 256,
        });
        const raw = completion.choices[0]?.message?.content?.trim();
        if (raw) { insight = raw; modelUsed = GROQ_MODEL; }
      } catch (groqError: unknown) {
        console.error('[KPI Insight] Groq failed:', groqError instanceof Error ? groqError.message : groqError);
      }
    }

    if (!insight) {
      const genAI = getGeminiClient();
      if (genAI) {
        try {
          const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const result = await geminiModel.generateContent(prompt);
          const raw = result.response.text().trim();
          if (raw) { insight = raw; modelUsed = 'gemini-2.5-flash'; }
        } catch (geminiError: unknown) {
          console.error('[KPI Insight] Gemini failed:', geminiError instanceof Error ? geminiError.message : geminiError);
        }
      }
    }

    if (!insight) {
      return NextResponse.json({ error: 'All AI providers failed. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ insight, model: modelUsed });
  } catch (error) {
    console.error('KPI Insight Error:', error);
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 });
  }
});
