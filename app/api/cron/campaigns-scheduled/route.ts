import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { sendCampaignNow } from '@/lib/services/campaigns';

// Vercel Cron (see vercel.json) hits this route with no user session,
// so it can't use withMultiTenancy — auth is a shared secret instead.
// Sends are attributed to the business's OWNER (falling back to ADMIN, then
// any member) since a scheduled send has no acting user.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dueCampaigns = await prisma.campaign.findMany({
    where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } },
  });

  let sent = 0;
  let failed = 0;

  for (const campaign of dueCampaigns) {
    try {
      const sender =
        (await prisma.user.findFirst({
          where: { businessId: campaign.businessId, role: 'OWNER' },
          select: { id: true, firstName: true, lastName: true, email: true },
        })) ||
        (await prisma.user.findFirst({
          where: { businessId: campaign.businessId, role: 'ADMIN' },
          select: { id: true, firstName: true, lastName: true, email: true },
        })) ||
        (await prisma.user.findFirst({
          where: { businessId: campaign.businessId },
          select: { id: true, firstName: true, lastName: true, email: true },
        }));

      if (!sender) {
        console.error(`No user found for business ${campaign.businessId}, skipping scheduled campaign ${campaign.id}`);
        failed++;
        continue;
      }

      const result = await sendCampaignNow(campaign.id, campaign.businessId, {
        userId: sender.id,
        name: `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || undefined,
        email: sender.email,
      });

      if (result.ok) sent++;
      else {
        failed++;
        console.error(`Scheduled campaign ${campaign.id} failed to send: ${result.error}`);
      }
    } catch (err) {
      failed++;
      console.error(`Error sending scheduled campaign ${campaign.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, processed: dueCampaigns.length, sent, failed });
}
