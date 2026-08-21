import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { sendClientEmail } from '@/lib/services/email';
import { generateInvoicePdf, generateInvoiceCsv } from '@/lib/services/invoice-documents';

export const POST = withMultiTenancy(async (req, { params, dataFilter, business, user }) => {
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

    const formattedAmount = `$${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const userMessageHtml = message
      .split('\n')
      .map((line: string) => `<p style="margin: 0 0 10px; font-size: 14px; color: #334155; line-height: 1.6;">${line || '&nbsp;'}</p>`)
      .join('');

    const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  <div style="background: linear-gradient(135deg, #ea580c, #f59e0b); padding: 32px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${business.name}</h1>
    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95; font-weight: 500;">Invoice #${invoice.number}</p>
  </div>
  
  <div style="padding: 28px 24px;">
    ${userMessageHtml}
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="color: #64748b; padding: 6px 0; font-weight: 500;">Invoice Reference:</td>
          <td style="font-weight: 700; text-align: right; color: #0f172a; font-family: monospace;">${invoice.number}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0; font-weight: 500;">Billed To:</td>
          <td style="font-weight: 600; text-align: right; color: #0f172a;">${invoice.clientName}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0; font-weight: 500;">Payment Due Date:</td>
          <td style="font-weight: 600; text-align: right; color: #0f172a;">${formattedDueDate}</td>
        </tr>
        <tr style="border-top: 2px solid #e2e8f0;">
          <td style="font-size: 15px; font-weight: 800; color: #0f172a; padding: 14px 0 0;">Total Amount Due:</td>
          <td style="font-size: 20px; font-weight: 900; color: #ea580c; text-align: right; padding: 14px 0 0; font-family: monospace;">${formattedAmount}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 12px 16px; margin: 16px 0; text-align: center;">
      <p style="margin: 0; font-size: 12px; font-weight: 600; color: #92400e;">
        📎 Your official itemized PDF invoice and CSV audit record are attached.
      </p>
    </div>
  </div>
  
  <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 500;">
      Sent securely via Okleevo SME Operating System on behalf of ${business.name}
    </p>
  </div>
</div>`;

    const items = Array.isArray(invoice.items)
      ? (invoice.items as { description: string; quantity: number; rate: number }[])
      : [];

    const docData = {
      number: invoice.number,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      amount: invoice.amount,
      status: invoice.status,
      createdAt: invoice.createdAt,
      dueDate: invoice.dueDate,
      items,
      businessName: business.name,
    };

    const senderUserName = user ? `${user.firstName} ${user.lastName}`.trim() : undefined;

    const result = await sendClientEmail({
      to,
      subject,
      html,
      text: message,
      userName: senderUserName,
      businessName: business.name,
      attachments: [
        { filename: `${invoice.number}.pdf`, content: generateInvoicePdf(docData), contentType: 'application/pdf' },
        { filename: `${invoice.number}.csv`, content: generateInvoiceCsv(docData), contentType: 'text/csv' },
      ],
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
