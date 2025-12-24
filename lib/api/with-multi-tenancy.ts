import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getDataIsolationFilter } from '@/lib/multi-tenancy';
import { hasPermission } from '@/lib/clerk/rbac';

/**
 * API Route wrapper for multi-tenancy
 * Automatically adds SME context and data isolation
 */
export function withMultiTenancy(
  handler: (req: NextRequest, context: {
    user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
    business: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>['business'];
    dataFilter: ReturnType<typeof getDataIsolationFilter>;
  }) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const user = await getCurrentUser();

      if (!user || !user.business) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const dataFilter = getDataIsolationFilter(
        user.id,
        user.businessId,
        user.role
      );

      return handler(req, { user, business: user.business, dataFilter });
    } catch (error) {
      console.error('Multi-tenancy error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * API Route wrapper with RBAC check
 */
export function withRBAC(
  resource: string,
  action: string,
  handler: (req: NextRequest, context: {
    user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
    business: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>['business'];
    dataFilter: ReturnType<typeof getDataIsolationFilter>;
  }) => Promise<NextResponse>
) {
  return withMultiTenancy(async (req, context) => {
    if (!hasPermission(context.user.role, resource, action)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req, context);
  });
}

