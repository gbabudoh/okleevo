import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize clients lazily to avoid errors if keys are missing
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

export async function POST(req: NextRequest) {
  try {
    const { template, formData } = await req.json();

    if (!template || !formData) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Diagnostic: Check for API keys
    console.log('[AI Gateway] Keys detected:', { 
      groq: !!process.env.GROQ_API_KEY, 
      gemini: !!process.env.GEMINI_API_KEY 
    });

    const prompt = `You are a professional content strategist.
Generate a ${template.name} for the following parameters:
${Object.entries(formData).map(([key, value]) => `${key.toUpperCase()}: ${value}`).join('\n')}

Requirements:
- Tone: ${formData.tone || formData.style || 'Professional'}
- Format: Professional Markdown
- Focus: High-conversion, strategic communication
- Do NOT mention which AI model you are.
- Start directly with a compelling title.`;

    // Strategy: Try Groq first for speed, fallback to Gemini
    const groq = getGroqClient();
    if (groq) {
      try {
        console.log('[AI Gateway] Attempting Groq synthesis...');
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 1024,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          console.log('[AI Gateway] Groq synthesis successful.');
          return NextResponse.json({ content });
        }
      } catch (groqError: unknown) {
        const errorMessage = groqError instanceof Error ? groqError.message : String(groqError);
        console.error('[AI Gateway] Groq failed:', errorMessage);
      }
    }

    // Fallback to Gemini
    const genAI = getGeminiClient();
    if (genAI) {
      try {
        console.log('[AI Gateway] Attempting Gemini fallback...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const content = response.text();

        console.log('[AI Gateway] Gemini synthesis successful.');
        return NextResponse.json({ content });
      } catch (geminiError: unknown) {
        const errorMessage = geminiError instanceof Error ? geminiError.message : String(geminiError);
        console.error('[AI Gateway] Gemini failed:', errorMessage);
      }
    }

    // If both fail or no keys provided
    return NextResponse.json({ 
      error: 'All synthesis engines unavailable',
      details: 'Both Groq and Gemini failed to generate content.'
    }, { status: 500 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Gateway] Critical failure:', errorMessage);
    return NextResponse.json({ 
      error: 'Failed to synthesize intelligence package',
      details: errorMessage
    }, { status: 500 });
  }
}
