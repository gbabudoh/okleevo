import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/clerk/audit-log';
import { journalizeInvoice } from '@/lib/accounting/accounting';

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

    // Explicit field whitelist — body is untrusted client input, and Invoice
    // carries tenant/ownership fields (businessId, userId, journalEntryId)
    // that must never be settable from a PATCH payload.
    const {
      clientName, clientEmail, clientAddress, amount, items,
      dueDate, projectId, status, paidAt, notes, category, currency
    } = body;

    const isNewlyPaid = status === 'PAID' && existingInvoice.status !== 'PAID';
    // Reopening a paid invoice (status moving away from PAID) must reverse its
    // accounting impact — voiding the linked JournalEntry rather than deleting
    // it, since reports filter to status: 'POSTED' and audit trails should
    // never lose history of what actually happened.
    const isLeavingPaid = existingInvoice.status === 'PAID' && status !== undefined && status !== 'PAID';

    const updatedInvoice = await prisma.invoice.update({
      where: { id: existingInvoice.id },
      data: {
        ...(clientName !== undefined && { clientName }),
        ...(clientEmail !== undefined && { clientEmail }),
        ...(clientAddress !== undefined && { clientAddress }),
        ...(amount !== undefined && { amount: parseFloat(amount) || 0 }),
        ...(currency !== undefined && { currency }),
        ...(items !== undefined && { items }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : undefined }),
        ...(projectId !== undefined && { projectId: projectId || null }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(category !== undefined && { category }),
        ...(isNewlyPaid && { paidAt: paidAt ? new Date(paidAt) : new Date() }),
        ...(isLeavingPaid && { paidAt: null, journalEntryId: null }),
      },
    });

    await createAuditLog({
      action: 'UPDATE',
      resourceType: 'Invoice',
      resourceId: updatedInvoice.id,
      changes: { before: existingInvoice, after: updatedInvoice },
    });

    let journalWarning: string | undefined;
    if (isNewlyPaid) {
      try {
        await journalizeInvoice(updatedInvoice.id);
      } catch (journalError) {
        console.error('Failed to journalize paid invoice:', journalError);
        journalWarning = 'Invoice marked as paid, but the accounting journal entry could not be created. Check the Accounting module.';
      }
    } else if (isLeavingPaid && existingInvoice.journalEntryId) {
      try {
        await prisma.journalEntry.update({
          where: { id: existingInvoice.journalEntryId },
          data: { status: 'VOID' },
        });
      } catch (voidError) {
        console.error('Failed to void journal entry for reopened invoice:', voidError);
        journalWarning = 'Invoice reopened, but its accounting journal entry could not be voided. Check the Accounting module.';
      }
    }

    return NextResponse.json({ data: updatedInvoice, warning: journalWarning });
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
