import { NextRequest, NextResponse } from 'next/server';

// AI Content Generation API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // TODO: Integrate with AI service (OpenAI, Anthropic, etc.)
    // For now, return a mock response
    const mockResponse = {
      content: `Generated content based on: ${prompt}`,
      type: type || 'general',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

// Get AI usage stats
export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch actual usage stats from database
    const mockStats = {
      totalRequests: 150,
      thisMonth: 45,
      remainingCredits: 955,
      lastUsed: new Date().toISOString(),
    };

    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('AI Stats Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
