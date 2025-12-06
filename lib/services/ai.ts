import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Initialize AI clients
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export interface AIGenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

// Generate content using Google Gemini
export async function generateWithGemini(options: AIGenerateOptions): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(options.prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
}

// Generate content using Groq
export async function generateWithGroq(options: AIGenerateOptions): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: options.prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1024,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq generation error:', error);
    throw error;
  }
}

// Generate blog post
export async function generateBlogPost(topic: string): Promise<string> {
  const prompt = `Write a professional blog post about: ${topic}. Include an introduction, main points, and conclusion.`;
  return generateWithGemini({ prompt });
}

// Generate social media content
export async function generateSocialPost(topic: string, platform: string): Promise<string> {
  const prompt = `Create an engaging ${platform} post about: ${topic}. Keep it concise and include relevant hashtags.`;
  return generateWithGroq({ prompt, maxTokens: 280 });
}

// Summarize text
export async function summarizeText(text: string): Promise<string> {
  const prompt = `Summarize the following text in 2-3 sentences:\n\n${text}`;
  return generateWithGemini({ prompt });
}

// Generate meeting notes
export async function generateMeetingNotes(transcript: string): Promise<string> {
  const prompt = `Create structured meeting notes from this transcript:\n\n${transcript}\n\nInclude: Key Points, Action Items, and Decisions Made.`;
  return generateWithGemini({ prompt });
}
