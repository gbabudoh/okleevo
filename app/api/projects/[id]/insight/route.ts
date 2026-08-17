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

// Same real, verified-working models used across the app's other AI routes
// (see app/api/ai/generate/route.ts) — llama-3.3-70b-versatile is deprecated
// from this account's Groq catalog and 404s on every call.
const GROQ_MODEL = 'openai/gpt-oss-120b';

const buildPrompt = (name: string, status: string, budget: number | null, revenue: number, expenses: number, laborCost: number, netProfit: number, margin: number, isOverdue: boolean) => `You are a project finance analyst writing a short insight for a project management dashboard.
Project: ${name} (status: ${status})
${budget !== null ? `Budget: £${budget.toLocaleString()}` : 'Budget: not set'}
Revenue (paid invoices): £${revenue.toLocaleString()}
Direct costs (expenses + labor): £${expenses.toLocaleString()} (of which labor: £${laborCost.toLocaleString()})
Net profit: £${netProfit.toLocaleString()} (margin: ${margin.toFixed(1)}%)
${isOverdue ? 'This project is past its due date and not yet completed.' : ''}

Write a 2-3 sentence analysis: what this specific financial position suggests, and one concrete, relevant recommendation. Be specific to these actual numbers — do not give generic advice. If revenue is £0, say so plainly rather than guessing. Respond with plain text only, no markdown, no preamble.`;

export const POST = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;
    const projectId = id as string;

    const project = await prisma.project.findFirst({
      where: { id: projectId, businessId: user.businessId },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const [revenueAgg, expenseAgg, timeEntries] = await Promise.all([
      prisma.invoice.aggregate({
        where: { projectId, businessId: user.businessId, status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { projectId, businessId: user.businessId },
        _sum: { amount: true },
      }),
      prisma.timeEntry.findMany({
        where: { projectId, businessId: user.businessId },
        include: { employee: { select: { hourlyRate: true } } },
      }),
    ]);

    const revenue = revenueAgg._sum.amount || 0;
    const rawExpenses = expenseAgg._sum.amount || 0;
    const laborCost = timeEntries.reduce((sum, entry) => sum + entry.hoursLogged * (entry.employee.hourlyRate || 0), 0);
    const totalExpenses = rawExpenses + laborCost;
    const netProfit = revenue - totalExpenses;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const isOverdue = !!(project.dueDate && project.dueDate < new Date() && project.status !== 'COMPLETED' && project.status !== 'ARCHIVED');

    const prompt = buildPrompt(project.name, project.status, project.budget, revenue, totalExpenses, laborCost, netProfit, margin, isOverdue);

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
        console.error('[Project Insight] Groq failed:', groqError instanceof Error ? groqError.message : groqError);
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
          console.error('[Project Insight] Gemini failed:', geminiError instanceof Error ? geminiError.message : geminiError);
        }
      }
    }

    if (!insight) {
      return NextResponse.json({ error: 'All AI providers failed. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ insight, model: modelUsed });
  } catch (error) {
    console.error('Project Insight Error:', error);
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 });
  }
});
