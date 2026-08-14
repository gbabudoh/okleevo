import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/services/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim() || null;
    const message = (body.message || '').trim() || null;
    const slug = (body.slug || '').trim();

    if (!name || !email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'A valid name and email address are required.' }, { status: 400 });
    }
    if (!slug) {
      return NextResponse.json({ error: 'Missing page reference.' }, { status: 400 });
    }

    const page = await prisma.microPage.findUnique({ where: { slug } });
    if (!page || page.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'This page is no longer accepting submissions.' }, { status: 404 });
    }

    // No session on a public route — attribute the CRM contact to the
    // business's earliest active user (reliably its owner), same approach
    // used for other unauthenticated writes (see app/api/webhooks/postal/inbound/route.ts).
    const owner = await prisma.user.findFirst({
      where: { businessId: page.businessId, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });
    if (!owner) {
      return NextResponse.json({ error: 'Unable to process submission for this page.' }, { status: 500 });
    }

    const { lead } = await prisma.$transaction(async (tx) => {
      const existingContact = await tx.contact.findFirst({
        where: { businessId: page.businessId, email },
      });

      const contact = existingContact
        ? await tx.contact.update({
            where: { id: existingContact.id },
            data: { lastContact: new Date() },
          })
        : await tx.contact.create({
            data: {
              name,
              email,
              phone,
              status: 'LEAD',
              clientType: 'business',
              pipelineStage: 'new',
              source: `Micro Page: ${page.title}`,
              notes: message,
              lastContact: new Date(),
              businessId: page.businessId,
              userId: owner.id,
            },
          });

      const lead = await tx.microPageLead.create({
        data: {
          businessId: page.businessId,
          microPageId: page.id,
          contactId: contact.id,
          name,
          email,
          phone,
          message,
        },
      });

      await tx.microPage.update({
        where: { id: page.id },
        data: { conversions: { increment: 1 } },
      });

      return { lead };
    });

    // Best-effort notifications — a failure here must not fail the submission,
    // which has already been durably recorded above.
    try {
      const recipients = await prisma.user.findMany({
        where: { businessId: page.businessId, status: 'ACTIVE' },
        select: { id: true, email: true },
      });

      if (recipients.length > 0) {
        await prisma.notification.createMany({
          data: recipients.map((r) => ({
            userId: r.id,
            businessId: page.businessId,
            title: 'New Micro Page Lead',
            message: `${name} submitted the form on "${page.title}"`,
            type: 'success',
            link: '/dashboard/micro-pages',
          })),
        });
      }

      await sendEmail({
        to: owner.email,
        subject: `New lead from "${page.title}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fc6813;">New Micro Page Lead</h2>
            <p><strong>Page:</strong> ${page.title}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            <p style="margin-top: 24px;">This lead has been added to your CRM.</p>
          </div>
        `,
        text: `New lead from "${page.title}": ${name} <${email}>${phone ? ` / ${phone}` : ''}${message ? `\n\n${message}` : ''}`,
      });
    } catch (notifyError) {
      console.error('Micro Page Submission notification error:', notifyError);
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error('Micro Page Submission API Error:', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
