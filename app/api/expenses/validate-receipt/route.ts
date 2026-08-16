import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { resolveReceiptUrl } from '@/lib/services/minio';

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const PROMPT = `You are analyzing a UK business expense receipt image for HMRC compliance.
Extract the following and respond with ONLY a JSON object (no markdown fences, no prose):
{
  "vatNumber": string or null (the VAT registration number shown on the receipt, if any),
  "vatAmount": number or null (the VAT amount charged, if shown),
  "compliant": boolean (true only if the receipt clearly shows a VAT registration number, date, supplier name, and total amount),
  "notes": string (brief note on what's missing if not compliant, or "Compliant" if it is)
}`;

interface ReceiptExtraction {
  vatNumber: string | null;
  vatAmount: number | null;
  compliant: boolean;
  notes: string;
}

function parseExtraction(raw: string): ReceiptExtraction | null {
  try {
    const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      vatNumber: parsed.vatNumber ?? null,
      vatAmount: typeof parsed.vatAmount === 'number' ? parsed.vatAmount : null,
      compliant: !!parsed.compliant,
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
    };
  } catch {
    return null;
  }
}

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const { expenseId } = await req.json();

    if (!expenseId) {
      return NextResponse.json({ error: 'expenseId is required' }, { status: 400 });
    }

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, businessId: user.businessId },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (!expense.receipt) {
      return NextResponse.json({ error: 'This expense has no receipt image attached' }, { status: 400 });
    }

    // Vision/image-understanding only works via Gemini here — Groq's currently
    // used model (llama-3.3-70b-versatile) is text-only, and Groq's vision
    // model lineup has been through repeated deprecation/preview churn, so
    // there is no reliable Groq fallback for the image-understanding step
    // (unlike app/api/ai/generate/route.ts's Groq-then-Gemini text fallback).
    const genAI = getGeminiClient();
    if (!genAI) {
      return NextResponse.json({ error: 'Receipt validation is unavailable (Gemini not configured)' }, { status: 503 });
    }

    // receipt is stored as a stable object key (or, for older rows, a
    // presigned URL whose signature has since expired) — resolve it to a
    // freshly-signed URL right before fetching rather than trusting whatever
    // was saved at upload time.
    const freshReceiptUrl = await resolveReceiptUrl(expense.receipt);
    if (!freshReceiptUrl) {
      return NextResponse.json({ error: 'Receipt file could not be located in storage' }, { status: 502 });
    }

    const imageRes = await fetch(freshReceiptUrl);
    if (!imageRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch receipt image' }, { status: 502 });
    }
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await imageRes.arrayBuffer());
    const base64 = buffer.toString('base64');

    // gemini-1.5-flash was retired; gemini-2.5-flash is the current stable
    // vision-capable equivalent (verified against the live models list).
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      { text: PROMPT },
      { inlineData: { data: base64, mimeType: contentType } },
    ]);

    const extraction = parseExtraction(result.response.text());
    if (!extraction) {
      return NextResponse.json({ error: 'Could not parse receipt data from AI response' }, { status: 502 });
    }

    const updated = await prisma.expense.update({
      where: { id: expense.id },
      data: {
        vatNumber: extraction.vatNumber,
        vatAmount: extraction.vatAmount,
        receiptValidated: extraction.compliant,
        receiptValidationNotes: extraction.notes,
      },
    });

    return NextResponse.json({
      vatNumber: updated.vatNumber,
      vatAmount: updated.vatAmount,
      receiptValidated: updated.receiptValidated,
      receiptValidationNotes: updated.receiptValidationNotes,
    });
  } catch (error) {
    console.error('Validate Receipt Error:', error);
    return NextResponse.json({ error: 'Failed to validate receipt' }, { status: 500 });
  }
});
