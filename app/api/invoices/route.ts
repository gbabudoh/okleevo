import { NextRequest, NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/clerk/audit-log';

// Get all invoices for the current SME
export const GET = withMultiTenancy(async (req, { user, org, dataFilter }) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      ...dataFilter, // Automatically filters by smeId and userId based on role
    };

    if (status) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
});

// Create new invoice
export const POST = withMultiTenancy(async (req, { user, org, dataFilter }) => {
  try {
    const body = await req.json();
    const { clientName, clientEmail, amount, items, dueDate } = body;

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { businessId: user.businessId },
    });
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        businessId: user.businessId,
        userId: user.id,
        clientName,
        clientEmail,
        amount: parseFloat(amount),
        items: items || [],
        dueDate: new Date(dueDate),
        status: 'DRAFT',
      },
    });

    // Create audit log (Tier 2+)
    await createAuditLog({
      action: 'CREATE',
      resourceType: 'Invoice',
      resourceId: invoice.id,
      changes: { created: invoice },
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
});

