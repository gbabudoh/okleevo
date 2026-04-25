import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form || form.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Form not found or inactive' }, { status: 404 });
    }

    // Save response
    const response = await prisma.formResponse.create({
      data: {
        formId: id,
        data: body,
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
            data: body,
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
