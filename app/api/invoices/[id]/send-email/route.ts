import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { sendClientEmail } from '@/lib/services/email';

export const POST = withMultiTenancy(async (req, { params, dataFilter, business }) => {
  const resolvedParams = await params;
  const id = resolvedParams.id as string;
  try {
    const { to, subject, message } = await req.json();
    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Recipient, subject, and message are required' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { AND: [{ OR: [{ id }, { number: id }] }, dataFilter] },
    });
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const html = message
      .split('\n')
      .map((line: string) => `<p style="margin:0 0 12px;">${line || '&nbsp;'}</p>`)
      .join('');

    const result = await sendClientEmail({
      to,
      subject,
      html,
      text: message,
      businessName: business.name,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 502 });
    }

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'SENT' },
    });

    return NextResponse.json({ data: updated, messageId: result.messageId });
  } catch (error) {
    console.error('Send invoice email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
});
