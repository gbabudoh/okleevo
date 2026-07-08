import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/lib/prisma-client';
import { InvoiceStatus } from '@/lib/prisma-client';
import { createAuditLog } from '@/lib/clerk/audit-log';

// Get all invoices for the current SME
export const GET = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Prisma.InvoiceWhereInput = {
      ...dataFilter, // Automatically filters by smeId and userId based on role
    };

    if (status) {
      where.status = status as InvoiceStatus;
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
  } catch (error: unknown) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
});

// Create new invoice
export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { clientName, clientEmail, amount, items, dueDate, projectId } = body;

    // Generate invoice number from the highest existing number for this business
    // (not a count, since a deleted invoice would otherwise make the count collide
    // with a still-existing number)
    const businessInvoices = await prisma.invoice.findMany({
      where: { businessId: user.businessId },
      select: { number: true },
    });
    const maxNumber = businessInvoices.reduce((max, inv) => {
      const match = inv.number.match(/(\d+)$/);
      const n = match ? parseInt(match[1], 10) : 0;
      return Math.max(max, n);
    }, 0);
    const invoiceNumber = `INV-${String(maxNumber + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        businessId: user.businessId,
        userId: user.id,
        clientName,
        clientEmail,
        amount: parseFloat(amount) || 0,
        items: items || [],
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        status: 'DRAFT',
        projectId: projectId || null,
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
  } catch (error: unknown) {
    console.error('Create invoice error:', error);
    const errMsg = error instanceof Error ? error.message : 'Failed to create invoice';
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
});

