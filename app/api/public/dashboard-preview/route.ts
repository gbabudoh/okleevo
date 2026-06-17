import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET - Retrieve landing page preview mock configuration (Public access)
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
      { 
        error: 'Failed to fetch landing preview configuration', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
