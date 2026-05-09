import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { sendClientEmail } from '@/lib/services/email';

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    // 1. Fetch Campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        businessId: user.businessId,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (!campaign.subject || !campaign.content) {
      return NextResponse.json({ error: 'Campaign must have a subject and content to be sent' }, { status: 400 });
    }

    // 2. Fetch Business Info
    const business = await prisma.business.findUnique({
      where: { id: user.businessId },
      select: { name: true },
    });

    // 3. Resolve Audience (for now, All Subscribers = All Contacts with emails)
    const contacts = await prisma.contact.findMany({
      where: {
        businessId: user.businessId,
        email: { not: '' },
      },
      select: { email: true, name: true },
    });

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts found in the selected audience' }, { status: 400 });
    }

    // Safety Cap: 100 recipients
    if (contacts.length > 100) {
      return NextResponse.json({ 
        error: 'Safety Limit Exceeded', 
        details: `Your internal SMTP engine is limited to 100 recipients per campaign to prevent spam flagging. Current audience size: ${contacts.length}. Please filter your audience or use a dedicated marketing service for larger lists.` 
      }, { status: 400 });
    }

    // 4. Update status to SENDING
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING' },
    });

    // 5. Send Emails
    let sentCount = 0;
    let failCount = 0;

    for (const contact of contacts) {
      try {
        const result = await sendClientEmail({
          to: contact.email,
          subject: campaign.subject,
          html: campaign.content.replace(/\n/g, '<br/>'),
          text: campaign.content,
          businessName: business?.name || 'Your Business',
          businessEmail: user.email,
        });

        if (result.success) {
          sentCount++;
          // Log individual send
          await prisma.emailLog.create({
            data: {
              businessId: user.businessId,
              userId: user.id,
              to: contact.email,
              subject: campaign.subject,
              body: campaign.content,
              status: 'SENT',
              messageId: result.messageId,
            },
          });
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Failed to send campaign email to ${contact.email}:`, err);
        failCount++;
      }
    }

    // 6. Final Update
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        sentCount: { increment: sentCount },
        bouncedCount: { increment: failCount },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Campaign sent to ${sentCount} recipients.`,
      stats: { sent: sentCount, failed: failCount },
    });
  } catch (error) {
    console.error('Campaign Send API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
