import { NextRequest, NextResponse } from 'next/server';

// Get usage statistics
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'current'; // current, last_month, all_time

    // TODO: Fetch actual usage from database
    const mockUsage = {
      period,
      subscription: {
        plan: 'All-in-One Plan',
        amount: 1999,
        currency: 'gbp',
      },
      modules: {
        invoicing: {
          invoicesCreated: 45,
          limit: 'unlimited',
        },
        crm: {
          contactsAdded: 120,
          limit: 'unlimited',
        },
        ai: {
          requestsUsed: 150,
          limit: 1000,
          remaining: 850,
        },
        storage: {
          used: '2.5 GB',
          limit: 'unlimited',
        },
      },
      users: {
        active: 5,
        limit: 'unlimited',
      },
      apiCalls: {
        total: 1250,
        thisMonth: 450,
      },
    };

    return NextResponse.json(mockUsage);
  } catch (error) {
    console.error('Get Usage Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}
