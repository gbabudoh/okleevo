import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/clerk/audit-log';

// Get individual invoice
export const GET = withMultiTenancy(async (req, { params, dataFilter }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const invoice = await prisma.invoice.findFirst({
      where: {
        AND: [
          { OR: [{ id }, { number: id }] },
          dataFilter
        ]
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ data: invoice });
  } catch (error: unknown) {
    console.error('Get invoice error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
});

// Update individual invoice
export const PATCH = withMultiTenancy(async (req, { params, dataFilter, user }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    const body = await req.json();
    
    // Find first to verify ownership
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        AND: [
          { OR: [{ id }, { number: id }] },
          dataFilter
        ]
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: existingInvoice.id },
      data: {
        ...body,
        // Ensure some fields are not overwritten or are formatted correctly
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        amount: body.amount ? parseFloat(body.amount) : undefined,
      },
    });

    await createAuditLog({
      action: 'UPDATE',
      resourceType: 'Invoice',
      resourceId: updatedInvoice.id,
      changes: { before: existingInvoice, after: updatedInvoice },
    });

    return NextResponse.json({ data: updatedInvoice });
  } catch (error: unknown) {
    console.error('Update invoice error:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
});

// Delete individual invoice
export const DELETE = withMultiTenancy(async (req, { params, dataFilter }) => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id as string;
    
    // Find first to verify ownership
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        AND: [
          { OR: [{ id }, { number: id }] },
          dataFilter
        ]
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await prisma.invoice.delete({
      where: { id: existingInvoice.id },
    });

    await createAuditLog({
      action: 'DELETE',
      resourceType: 'Invoice',
      resourceId: existingInvoice.id,
      changes: { deleted: existingInvoice },
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error: unknown) {
    console.error('Delete invoice error:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
});
