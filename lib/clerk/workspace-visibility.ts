import { prisma } from '@/lib/prisma';

/**
 * Visibility type for resources
 */
export type VisibilityType = 'PRIVATE' | 'SHARED';

/**
 * Set visibility for a resource
 * Tier 2 Feature: Shared vs Private workspaces
 */
export async function setResourceVisibility(params: {
  resourceType: string;
  resourceId: string;
  smeId: string;
  visibility: VisibilityType;
  sharedWithUserIds?: string[];
}) {
  return prisma.workspaceVisibility.upsert({
    where: {
      resourceType_resourceId: {
        resourceType: params.resourceType,
        resourceId: params.resourceId,
      },
    },
    update: {
      visibility: params.visibility,
      sharedWithUserIds: params.sharedWithUserIds || [],
      updatedAt: new Date(),
    },
    create: {
      smeId: params.smeId, // smeId is same as businessId
      businessId: params.smeId,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      visibility: params.visibility,
      sharedWithUserIds: params.sharedWithUserIds || [],
    },
  });
}

/**
 * Check if user can access a resource based on visibility
 */
export async function canUserAccessResource(params: {
  resourceType: string;
  resourceId: string;
  userId: string;
  userRole: string;
}): Promise<boolean> {
  const visibility = await prisma.workspaceVisibility.findUnique({
    where: {
      resourceType_resourceId: {
        resourceType: params.resourceType,
        resourceId: params.resourceId,
      },
    },
  });

  // If no visibility record, default to private (only creator can see)
  if (!visibility) {
    return false;
  }

  // If shared, check if user has access
  if (visibility.visibility === 'SHARED') {
    // Admins and Owners can always access shared resources
    if (params.userRole === 'ADMIN' || params.userRole === 'OWNER') {
      return true;
    }

    // If sharedWithUserIds is empty, all users in SME can access
    if (visibility.sharedWithUserIds.length === 0) {
      return true;
    }

    // Check if user is in the shared list
    return visibility.sharedWithUserIds.includes(params.userId);
  }

  // Private resources: only creator can access (checked elsewhere)
  return false;
}

/**
 * Get visibility for a resource
 */
export async function getResourceVisibility(resourceType: string, resourceId: string) {
  return prisma.workspaceVisibility.findUnique({
    where: {
      resourceType_resourceId: {
        resourceType,
        resourceId,
      },
    },
  });
}

