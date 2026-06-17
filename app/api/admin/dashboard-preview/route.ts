import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';

export const runtime = 'nodejs';

/**
 * Check if user is super admin
 */
async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'SUPER_ADMIN';
}

/**
 * GET - Retrieve landing page preview mock configuration
 */
export async function GET() {
  try {
    const config = await prisma.landingPreviewConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      // Create and return initial default row
      const newConfig = await prisma.landingPreviewConfig.create({
        data: {
          id: 'default',
          activeTab: 'crm',
          crmTotalRevenue: 12450.00,
          crmClientCount: 8,
          crmContactsJson: JSON.stringify([
            { name: "Alex Mercer", email: "alex@designco.uk", stage: "Lead", value: 4500.00 },
            { name: "Sarah Jenkins", email: "sarah@jenkinslegal.co.uk", stage: "Customer", value: 3200.00 },
            { name: "David Cole", email: "david@colebuilders.uk", stage: "Contact", value: 1500.00 }
          ]),
          invUnpaidCount: 3,
          invTotalUnpaid: 1850.00,
          invInvoicesJson: JSON.stringify([
            { number: "INV-2026-001", client: "Acme Corp Ltd", amount: 950.00, status: "Pending" },
            { number: "INV-2026-002", client: "Sarah Jenkins", amount: 650.00, status: "Overdue" },
            { number: "INV-2026-003", client: "David Cole", amount: 250.00, status: "Pending" }
          ]),
          tasksJson: JSON.stringify([
            { id: "1", title: "Review UK VAT returns", status: "TODO", priority: "HIGH" },
            { id: "2", title: "Follow up with Alex Mercer", status: "IN_PROGRESS", priority: "MEDIUM" },
            { id: "3", title: "Submit corporation tax draft", status: "TODO", priority: "HIGH" }
          ]),
          aiInputText: "Spent 45 mins with John. He wants to order 12 more units by Friday. Send invoice ASAP.",
          aiOutputText: "• Client: John\n• Action Item: Order 12 units by Friday\n• Task: Generate and send invoice."
        }
      });
      return NextResponse.json(newConfig);
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching landing preview config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing preview configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST - Save/Update mock configuration (Super Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!(await isSuperAdmin(userId))) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      activeTab,
      crmTotalRevenue,
      crmClientCount,
      crmContactsJson,
      invUnpaidCount,
      invTotalUnpaid,
      invInvoicesJson,
      tasksJson,
      aiInputText,
      aiOutputText,
    } = body;

    // Validate JSON structure to prevent landing page rendering failures
    try {
      if (crmContactsJson) JSON.parse(crmContactsJson);
      if (invInvoicesJson) JSON.parse(invInvoicesJson);
      if (tasksJson) JSON.parse(tasksJson);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid JSON string provided in mock data configuration' },
        { status: 400 }
      );
    }

    const config = await prisma.landingPreviewConfig.upsert({
      where: { id: 'default' },
      update: {
        activeTab: activeTab || 'crm',
        crmTotalRevenue: parseFloat(crmTotalRevenue !== undefined ? crmTotalRevenue : '12450.00'),
        crmClientCount: parseInt(crmClientCount !== undefined ? crmClientCount : '8'),
        crmContactsJson: crmContactsJson || '[]',
        invUnpaidCount: parseInt(invUnpaidCount !== undefined ? invUnpaidCount : '3'),
        invTotalUnpaid: parseFloat(invTotalUnpaid !== undefined ? invTotalUnpaid : '1850.00'),
        invInvoicesJson: invInvoicesJson || '[]',
        tasksJson: tasksJson || '[]',
        aiInputText: aiInputText || '',
        aiOutputText: aiOutputText || '',
      },
      create: {
        id: 'default',
        activeTab: activeTab || 'crm',
        crmTotalRevenue: parseFloat(crmTotalRevenue !== undefined ? crmTotalRevenue : '12450.00'),
        crmClientCount: parseInt(crmClientCount !== undefined ? crmClientCount : '8'),
        crmContactsJson: crmContactsJson || '[]',
        invUnpaidCount: parseInt(invUnpaidCount !== undefined ? invUnpaidCount : '3'),
        invTotalUnpaid: parseFloat(invTotalUnpaid !== undefined ? invTotalUnpaid : '1850.00'),
        invInvoicesJson: invInvoicesJson || '[]',
        tasksJson: tasksJson || '[]',
        aiInputText: aiInputText || '',
        aiOutputText: aiOutputText || '',
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error updating landing preview config:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update landing preview configuration' },
      { status: 500 }
    );
  }
}
