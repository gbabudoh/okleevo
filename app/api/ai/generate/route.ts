import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// The two real, distinct Groq models the "Engine" selector actually chooses
// between — 'fast' genuinely is a smaller/lower-latency model, not just a
// different label on the same request. (llama-3.3-70b-versatile and
// llama-3.1-8b-instant, used here previously, were silently 404ing on every
// single request — Groq deprecated both from this account's catalog — so
// every "Deep-Reasoning" and "Fast-Neural" generation was already falling
// through to Gemini regardless of which was picked. Verified these two
// against the live Groq API before switching.)
const GROQ_MODELS: Record<'deep' | 'fast', string> = {
  deep: 'openai/gpt-oss-120b',
  fast: 'openai/gpt-oss-20b',
};

export const POST = withMultiTenancy(async (req, { user, business }) => {
  try {
    const { template, formData, brandVoice, model } = await req.json();

    if (!template || !formData) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const engine: 'deep' | 'fast' = model === 'fast' ? 'fast' : 'deep';

    const fieldLines = Object.entries(formData as Record<string, string>)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
      .join('\n');

    const prompt = `You are a professional content strategist writing on behalf of ${business.name}.
Generate a ${template.name} for the following parameters:
${fieldLines}
${brandVoice?.desc ? `\nBrand Voice: ${brandVoice.desc}` : ''}

Requirements:
- Tone: ${formData.tone || formData.style || 'Professional'}
- Format: Professional Markdown
- Focus: High-conversion, strategic communication
- Do NOT mention which AI model you are.
- Start directly with a compelling title.`;

    let content: string | undefined;
    let modelUsed: string | undefined;

    const groq = getGroqClient();
    if (groq) {
      try {
        const groqModel = GROQ_MODELS[engine];
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: groqModel,
          temperature: 0.7,
          max_tokens: 1024,
        });
        content = completion.choices[0]?.message?.content ?? undefined;
        if (content) modelUsed = groqModel;
      } catch (groqError: unknown) {
        console.error('[AI] Groq failed:', groqError instanceof Error ? groqError.message : groqError);
      }
    }

    if (!content) {
      const genAI = getGeminiClient();
      if (genAI) {
        try {
          // gemini-1.5-flash was retired; gemini-2.5-flash is the current
          // stable equivalent (verified against the live models list).
          const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const result = await geminiModel.generateContent(prompt);
          content = result.response.text();
          if (content) modelUsed = 'gemini-2.5-flash';
        } catch (geminiError: unknown) {
          console.error('[AI] Gemini failed:', geminiError instanceof Error ? geminiError.message : geminiError);
        }
      }
    }

    if (!content || !modelUsed) {
      return NextResponse.json({ error: 'All AI providers failed. Please try again.' }, { status: 502 });
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;

    const generation = await prisma.aIGeneration.create({
      data: {
        businessId: user.businessId,
        userId: user.id,
        templateId: template.id,
        templateName: template.name,
        content,
        wordCount,
        model: modelUsed,
      },
    });

    return NextResponse.json({ content, model: modelUsed, wordCount, id: generation.id });
  } catch (error: unknown) {
    console.error('[AI] Request error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
});
