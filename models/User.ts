// User model types and utilities
export interface User {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  role: 'admin' | 'user' | 'manager';
  subscriptionTier: 'free' | 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'past_due';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  businessName?: string;
}

export interface UpdateUserInput {
  name?: string;
  businessName?: string;
  role?: User['role'];
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

export function hasActiveSubscription(user: User): boolean {
  return user.subscriptionStatus === 'active';
}

export function canAccessFeature(user: User, requiredTier: User['subscriptionTier']): boolean {
  const tierLevels = { free: 0, starter: 1, professional: 2, enterprise: 3 };
  return tierLevels[user.subscriptionTier] >= tierLevels[requiredTier];
}
