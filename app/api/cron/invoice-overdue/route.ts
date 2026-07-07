import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/lib/prisma-client';

const OVERDUE_GRACE_DAYS = 3;

// Cron runs with no logged-in user, so it can't use lib/clerk/audit-log.ts's
// createAuditLog (that helper calls getCurrentUser() and throws without a
// session). Write AuditLog rows directly instead, replicating its Tier 2+
// gating so cron-triggered entries follow the same visibility rule.
async function logSystemAudit(params: {
  businessId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
}) {
  const business = await prisma.business.findUnique({
    where: { id: params.businessId },
    select: { seatCount: true },
  });
  if (!business) return;

  const tier = business.seatCount <= 10 ? 1 : business.seatCount <= 20 ? 2 : 3;
  if (tier < 2) return;

  await prisma.auditLog.create({
    data: {
      smeId: params.businessId,
      businessId: params.businessId,
      userId: 'system',
      userEmail: 'system@okleevo.com',
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      changes: params.changes || {},
      metadata: params.metadata || {},
    },
  });
}

// Vercel Cron (see vercel.json) hits this route daily with no user session,
// so it can't use withMultiTenancy — auth is a shared secret instead.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - OVERDUE_GRACE_DAYS);

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['SENT', 'PENDING'] },
      dueDate: { lt: cutoff },
    },
    include: {
      project: { include: { contact: { select: { userId: true } } } },
    },
  });

  let processed = 0;

  for (const invoice of overdueInvoices) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'OVERDUE' },
    });

    let pausedTaskCount = 0;
    if (invoice.projectId) {
      const { count } = await prisma.task.updateMany({
        where: { projectId: invoice.projectId, status: { not: 'DONE' } },
        data: { status: 'PAUSED' },
      });
      pausedTaskCount = count;
    }

    const notifyUserId = invoice.project?.contact?.userId || invoice.userId;
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        businessId: invoice.businessId,
        title: 'Invoice Overdue',
        message: `Invoice ${invoice.number} for ${invoice.clientName} is overdue.` +
          (pausedTaskCount > 0 ? ` ${pausedTaskCount} linked task(s) paused.` : ''),
        type: 'warning',
        link: `/dashboard/invoicing`,
      },
    });

    await logSystemAudit({
      businessId: invoice.businessId,
      action: 'OVERDUE_AUTO_TRANSITION',
      resourceType: 'Invoice',
      resourceId: invoice.id,
      changes: { status: { from: invoice.status, to: 'OVERDUE' } },
      metadata: { pausedTaskCount, projectId: invoice.projectId },
    });

    processed++;
  }

  return NextResponse.json({ ok: true, processed });
}
