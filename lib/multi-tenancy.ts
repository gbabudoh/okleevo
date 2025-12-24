import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Get data isolation filter for queries
 * Ensures users only see data from their SME
 * 
 * Note: All users within the same business can see shared business data
 * for collaboration. Private data is still filtered by userId when needed.
 */
export function getDataIsolationFilter(userId: string, businessId: string, userRole: string) {
  // All users in the same business can see shared business data
  // This enables collaboration within the SME
  return {
    businessId: businessId,
  };
  
  // Note: For private resources, additional userId filtering should be applied
  // at the query level based on resource visibility settings
}

/**
 * Check if user has permission to access resource
 */
export function canAccessResource(
  resourceUserId: string,
  resourceBusinessId: string,
  currentUserId: string,
  currentBusinessId: string,
  currentUserRole: string
): boolean {
  // Must be in same SME
  if (resourceBusinessId !== currentBusinessId) {
    return false;
  }

  // Owners and Admins can access all resources in their SME
  if (currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') {
    return true;
  }

  // Managers can access team resources
  if (currentUserRole === 'MANAGER') {
    return true;
  }

  // Members can access shared business data (collaboration enabled)
  // For private resources, they can only access their own
  return true; // Collaboration enabled - all members can see shared data
}

/**
 * Helper to get authenticated user ID from NextAuth session
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const session = await auth();
    if (session?.user && (session.user as any).id) {
      return (session.user as any).id;
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('authjs.session-token')?.value || 
                         cookieStore.get('__Secure-authjs.session-token')?.value;
    
    if (!sessionToken) {
      return null;
    }

    const dbSession = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (dbSession?.user?.id) {
      return dbSession.user.id;
    }

    return null;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Get current user with business context
 */
export async function getCurrentUser() {
  const userId = await getAuthenticatedUserId();
  
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      business: {
        include: {
          subscription: true,
        },
      },
    },
  });

  return user;
}

