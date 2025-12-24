import { UserRole } from '@prisma/client';

/**
 * Role-Based Access Control (RBAC) Permissions
 */

export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    { resource: '*', actions: ['*'] }, // Full access to everything
  ],
  ADMIN: [
    { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'billing', actions: ['read', 'update'] },
    { resource: 'invoices', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'contacts', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'tasks', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'notes', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'expenses', actions: ['read', 'create', 'update', 'delete'] },
  ],
  MANAGER: [
    { resource: 'users', actions: ['read'] }, // Can see team members
    { resource: 'invoices', actions: ['read', 'create', 'update'] },
    { resource: 'contacts', actions: ['read', 'create', 'update'] },
    { resource: 'tasks', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'notes', actions: ['read', 'create', 'update'] },
    { resource: 'expenses', actions: ['read', 'create', 'update'] },
  ],
  MEMBER: [
    { resource: 'invoices', actions: ['read', 'create', 'update'] }, // Own invoices only
    { resource: 'contacts', actions: ['read', 'create', 'update'] }, // Own contacts only
    { resource: 'tasks', actions: ['read', 'create', 'update'] }, // Own tasks only
    { resource: 'notes', actions: ['read', 'create', 'update'] }, // Own notes only
    { resource: 'expenses', actions: ['read', 'create', 'update'] }, // Own expenses only
  ],
};

/**
 * Check if user has permission to perform action on resource
 */
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];

  for (const permission of permissions) {
    // Check for wildcard access
    if (permission.resource === '*' && permission.actions.includes('*')) {
      return true;
    }

    // Check for specific resource
    if (permission.resource === resource) {
      if (permission.actions.includes('*') || permission.actions.includes(action)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get user's tier based on seat count
 */
export function getUserTier(seatCount: number): 1 | 2 | 3 {
  if (seatCount <= 10) return 1;
  if (seatCount <= 20) return 2;
  return 3;
}

/**
 * Check if feature is available for tier
 */
export function isFeatureAvailable(feature: string, tier: number): boolean {
  const featureTiers: Record<string, number> = {
    'audit-logs': 2,
    'shared-workspaces': 2,
    'admin-dashboard': 2,
    'sso': 3,
    'scim': 3,
    'custom-roles': 3,
  };

  const requiredTier = featureTiers[feature] || 1;
  return tier >= requiredTier;
}

