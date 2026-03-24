import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { postMessage, notifyCustom } from '@/lib/services/mattermost';

// POST /api/notifications/mattermost — Test Mattermost connectivity + send custom notification
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { channel, message, title, channelId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // If title is provided, use the custom notifier with formatting
    if (title) {
      const result = await notifyCustom(channel || 'general', title, message);
      return NextResponse.json(result);
    }

    // Otherwise send raw message
    const result = await postMessage({
      channel_id: channelId,
      channelName: channel || 'general',
      message,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Mattermost API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/mattermost — Health check
export async function GET() {
  const configured = !!process.env.MATTERMOST_TOKEN && process.env.MATTERMOST_TOKEN !== 'your_token';

  return NextResponse.json({
    configured,
    url: process.env.MATTERMOST_URL || 'not set',
    team: process.env.MATTERMOST_TEAM || 'not set',
  });
}
