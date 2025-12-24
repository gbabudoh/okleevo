import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './multi-tenancy';

/**
 * Create an audit log entry
 * Tier 2 Feature: Available for 10-20 users
 */
export async function createAuditLog(params: {
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if audit logs are available (Tier 2+)
  const tier = user.business.seatCount <= 10 ? 1 : user.business.seatCount <= 20 ? 2 : 3;
  
  if (tier < 2) {
    // Audit logs not available for Tier 1
    return null;
  }

  return prisma.auditLog.create({
    data: {
      smeId: user.businessId, // smeId is same as businessId
      businessId: user.businessId,
      userId: user.id,
      userEmail: user.email,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      changes: params.changes || {},
      metadata: params.metadata || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

/**
 * Get audit logs for an SME
 */
export async function getAuditLogs(params: {
  smeId: string;
  resourceType?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = {
    smeId: params.smeId,
  };

  if (params.resourceType) {
    where.resourceType = params.resourceType;
  }

  if (params.userId) {
    where.userId = params.userId;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: params.limit || 50,
    skip: params.offset || 0,
  });
}

