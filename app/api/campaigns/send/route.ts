import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { sendCampaignNow } from '@/lib/services/campaigns';

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const senderName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined;

    const result = await sendCampaignNow(campaignId, user.businessId, {
      userId: user.id,
      name: senderName,
      email: user.email,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: `Campaign sent to ${result.sentCount} recipients.`,
      stats: { sent: result.sentCount, failed: result.failCount },
    });
  } catch (error) {
    console.error('Campaign Send API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
