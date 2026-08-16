import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/lib/prisma-client';

interface FormFieldDef {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
  required: boolean;
  options?: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form || form.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Form not found or inactive' }, { status: 404 });
    }

    const fieldList = Array.isArray(form.fieldList) ? (form.fieldList as unknown as FormFieldDef[]) : [];

    // Server-side validation — the public page's HTML5 `required` is only a
    // client convenience; anyone can POST directly to this endpoint and skip
    // it. Re-check required fields, and only keep data for fields that
    // actually exist on this form (drops unrelated/injected keys).
    const rawData = body as Record<string, unknown>;
    const sanitizedData: Record<string, unknown> = {};

    for (const field of fieldList) {
      const value = rawData[field.id];

      if (field.required) {
        const isMissing = field.type === 'checkbox'
          ? value !== true
          : value === undefined || value === null || String(value).trim() === '';
        if (isMissing) {
          return NextResponse.json({ error: `"${field.label}" is required` }, { status: 400 });
        }
      }

      if (field.type === 'email' && typeof value === 'string' && value.trim() !== '' && !EMAIL_RE.test(value.trim())) {
        return NextResponse.json({ error: `"${field.label}" must be a valid email address` }, { status: 400 });
      }

      if (field.type === 'select' && typeof value === 'string' && value !== '' && field.options && !field.options.includes(value)) {
        return NextResponse.json({ error: `"${field.label}" has an invalid selection` }, { status: 400 });
      }

      if (value !== undefined) {
        sanitizedData[field.id] = field.type === 'checkbox' ? value === true : value;
      }
    }

    // Save response
    const response = await prisma.formResponse.create({
      data: {
        formId: id,
        data: sanitizedData as Prisma.InputJsonValue,
      },
    });

    // Increment response count
    await prisma.form.update({
      where: { id },
      data: { responses: { increment: 1 } },
    });

    // Handle webhook if present
    if (form.webhookUrl) {
      try {
        await fetch(form.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formId: id,
            formName: form.name,
            responseId: response.id,
            data: sanitizedData,
            submittedAt: new Date().toISOString(),
          }),
        });
      } catch (webhookError) {
        console.error('Webhook failed:', webhookError);
        // We don't fail the submission if the webhook fails
      }
    }

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
