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

const ACTION_INSTRUCTIONS: Record<string, string> = {
  improve: 'Improve the grammar, clarity, and flow of this text. Keep the same meaning and roughly the same length.',
  professional: 'Rewrite this text in a more professional, polished tone suitable for business communication.',
  friendly: 'Rewrite this text in a warmer, more friendly and approachable tone.',
  shorten: 'Make this text more concise. Cut unnecessary words while preserving all key information.',
  expand: 'Expand this text into a fuller, more complete and detailed version, adding helpful context where appropriate.',
  summarize: 'Summarize this text into a short, clear summary capturing only the key points.',
};

export const POST = withMultiTenancy(async (req) => {
  try {
    const { text, action } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    const instruction = ACTION_INSTRUCTIONS[action];
    if (!instruction) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const prompt = `${instruction}

Respond with ONLY the rewritten text — no preamble, no explanation, no quotation marks around it.

Text:
${text}`;

    const groq = getGroqClient();
    if (groq) {
      try {
        // llama-3.3-70b-versatile was deprecated from this account's Groq
        // catalog — every request 404'd and silently fell through to Gemini
        // (see app/api/ai/generate/route.ts for the same fix, verified
        // against the live Groq API).
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'openai/gpt-oss-120b',
          temperature: 0.5,
          max_tokens: 1024,
        });
        const result = completion.choices[0]?.message?.content?.trim();
        if (result) return NextResponse.json({ result });
      } catch (groqError: unknown) {
        console.error('[AI Writing Assist] Groq failed:', groqError instanceof Error ? groqError.message : groqError);
      }
    }

    const genAI = getGeminiClient();
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const geminiResult = await model.generateContent(prompt);
        const result = geminiResult.response.text().trim();
        if (result) return NextResponse.json({ result });
      } catch (geminiError: unknown) {
        console.error('[AI Writing Assist] Gemini failed:', geminiError instanceof Error ? geminiError.message : geminiError);
      }
    }

    return NextResponse.json({ error: 'All AI providers failed. Please try again.' }, { status: 500 });
  } catch (error: unknown) {
    console.error('[AI Writing Assist] Request error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
  }
});
