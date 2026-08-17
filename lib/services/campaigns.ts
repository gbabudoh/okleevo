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

const RAW_URL_RE = /(https?:\/\/[^\s<>"']+)/g;

/**
 * Converts a plain-text campaign body (the composer is a bare textarea, no
 * rich text) into tracked HTML: line breaks become <br/>, and any bare URL
 * the user typed becomes a real, clickable link routed through the click
 * tracker so a real click can be counted before redirecting to the real
 * destination.
 */
function buildTrackedHtml(content: string, appUrl: string, logId: string): string {
  const withBreaks = content.replace(/\n/g, '<br/>');
  return withBreaks.replace(RAW_URL_RE, (url) => {
    const trackingUrl = `${appUrl}/api/campaigns/track/click?log=${logId}&url=${encodeURIComponent(url)}`;
    return `<a href="${trackingUrl}">${url}</a>`;
  });
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
    // The EmailLog row is created *before* sending — its id is what the
    // tracking pixel and click-redirect URLs are keyed on, so it has to
    // exist before the email goes out. Status/messageId are corrected
    // once the send result is known.
    const log = await prisma.emailLog.create({
      data: {
        businessId,
        userId: sender.userId,
        to: contact.email,
        subject: campaign.subject,
        body: campaign.content,
        status: 'SENT',
        campaignId: campaign.id,
      },
    });

    try {
      let unsubscribeToken = contact.unsubscribeToken;
      if (!unsubscribeToken) {
        unsubscribeToken = randomUUID();
        await prisma.contact.update({ where: { id: contact.id }, data: { unsubscribeToken } });
      }

      const unsubscribeUrl = `${env.APP_URL}/unsubscribe?token=${unsubscribeToken}`;
      const trackedContent = buildTrackedHtml(campaign.content, env.APP_URL, log.id);
      const pixelUrl = `${env.APP_URL}/api/campaigns/track/open?log=${log.id}`;
      const htmlBody = `${trackedContent}<hr/><p style="font-size:12px;color:#888;">Don't want these emails? <a href="${unsubscribeUrl}">Unsubscribe</a></p><img src="${pixelUrl}" width="1" height="1" alt="" style="display:none" />`;
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
        await prisma.emailLog.update({ where: { id: log.id }, data: { messageId: result.messageId } });
      } else {
        failCount++;
        await prisma.emailLog.update({ where: { id: log.id }, data: { status: 'FAILED', errorMessage: result.error } });
      }
    } catch (err) {
      console.error(`Failed to send campaign email to ${contact.email}:`, err);
      failCount++;
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', errorMessage: err instanceof Error ? err.message : 'Unknown error' },
      }).catch(() => {});
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
