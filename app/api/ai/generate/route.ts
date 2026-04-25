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

export const POST = withMultiTenancy(async (req) => {
  try {
    const { template, formData } = await req.json();

    if (!template || !formData) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const prompt = `You are a professional content strategist.
Generate a ${template.name} for the following parameters:
${Object.entries(formData).map(([key, value]) => `${key.toUpperCase()}: ${value}`).join('\n')}

Requirements:
- Tone: ${formData.tone || formData.style || 'Professional'}
- Format: Professional Markdown
- Focus: High-conversion, strategic communication
- Do NOT mention which AI model you are.
- Start directly with a compelling title.`;

    const groq = getGroqClient();
    if (groq) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 1024,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) return NextResponse.json({ content });
      } catch (groqError: unknown) {
        console.error('[AI] Groq failed:', groqError instanceof Error ? groqError.message : groqError);
      }
    }

    const genAI = getGeminiClient();
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const content = result.response.text();
        if (content) return NextResponse.json({ content });
      } catch (geminiError: unknown) {
        console.error('[AI] Gemini failed:', geminiError instanceof Error ? geminiError.message : geminiError);
      }
    }

    return NextResponse.json({ error: 'All AI providers failed. Please try again.' }, { status: 500 });
  } catch (error: unknown) {
    console.error('[AI] Request error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
});
