import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendClientEmail } from '@/lib/services/email';
import { env } from '@/config/env';
import type { Prisma } from '@/lib/prisma-client';

export const CAMPAIGN_SEND_RECIPIENT_CAP = 100;

/** Known audience segments selectable in the campaign UI. Free-text audiences
 *  that don't match one of these fall back to "All Subscribers". */
const SEGMENT_FILTERS: Record<string, Prisma.ContactWhereInput> = {
  'all subscribers': {},
  'vip customers': {
    OR: [{ status: 'CUSTOMER' }, { tags: { has: 'VIP' } }, { tags: { has: 'vip' } }],
  },
  'new signups': {
    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  },
  inactive: { status: 'INACTIVE' },
};

/** Resolves an audience label to the consenting, non-unsubscribed contacts it maps to. */
export async function resolveAudienceContacts(businessId: string, audience: string) {
  const segmentFilter = SEGMENT_FILTERS[audience.trim().toLowerCase()] ?? {};

  return prisma.contact.findMany({
    where: {
      businessId,
      email: { not: '' },
      gdprConsent: true,
      unsubscribedAt: null,
      ...segmentFilter,
    },
    select: { id: true, email: true, name: true, unsubscribeToken: true },
  });
}

export interface CampaignSender {
  userId: string;
  name?: string;
  email: string;
}

export type CampaignSendResult =
  | { ok: true; sentCount: number; failCount: number }
  | { ok: false; error: string; status: number };

/**
 * Sends a campaign to its resolved audience and updates counters/status.
 * Shared by the user-triggered send route and the scheduled-campaigns cron job.
 */
export async function sendCampaignNow(
  campaignId: string,
  businessId: string,
  sender: CampaignSender
): Promise<CampaignSendResult> {
  const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, businessId } });
  if (!campaign) return { ok: false, error: 'Campaign not found', status: 404 };

  if (!campaign.subject || !campaign.content) {
    return { ok: false, error: 'Campaign must have a subject and content to be sent', status: 400 };
  }

  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { name: true } });
  const contacts = await resolveAudienceContacts(businessId, campaign.audience);

  if (contacts.length === 0) {
    return { ok: false, error: 'No contacts found in the selected audience', status: 400 };
  }

  if (contacts.length > CAMPAIGN_SEND_RECIPIENT_CAP) {
    return {
      ok: false,
      status: 400,
      error:
        `Your internal SMTP engine is limited to ${CAMPAIGN_SEND_RECIPIENT_CAP} recipients per campaign to prevent spam flagging. ` +
        `Current audience size: ${contacts.length}. Please filter your audience or use a dedicated marketing service for larger lists.`,
    };
  }

  await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'SENDING' } });

  let sentCount = 0;
  let failCount = 0;

  for (const contact of contacts) {
    try {
      let unsubscribeToken = contact.unsubscribeToken;
      if (!unsubscribeToken) {
        unsubscribeToken = randomUUID();
        await prisma.contact.update({ where: { id: contact.id }, data: { unsubscribeToken } });
      }

      const unsubscribeUrl = `${env.APP_URL}/unsubscribe?token=${unsubscribeToken}`;
      const htmlBody = `${campaign.content.replace(/\n/g, '<br/>')}<hr/><p style="font-size:12px;color:#888;">Don't want these emails? <a href="${unsubscribeUrl}">Unsubscribe</a></p>`;
      const textBody = `${campaign.content}\n\nUnsubscribe: ${unsubscribeUrl}`;

      const result = await sendClientEmail({
        to: contact.email,
        subject: campaign.subject,
        html: htmlBody,
        text: textBody,
        userName: sender.name,
        businessName: business?.name || 'Your Business',
        businessEmail: sender.email,
      });

      if (result.success) {
        sentCount++;
        await prisma.emailLog.create({
          data: {
            businessId,
            userId: sender.userId,
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

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      sentCount: { increment: sentCount },
      bouncedCount: { increment: failCount },
    },
  });

  return { ok: true, sentCount, failCount };
}
