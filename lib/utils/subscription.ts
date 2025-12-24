import { Subscription } from '@prisma/client';

/**
 * Trial period in days
 */
export const TRIAL_PERIOD_DAYS = 14;

/**
 * Check if subscription is currently in trial period
 */
export function isTrialActive(subscription: Subscription | null): boolean {
  if (!subscription) {
    return false;
  }

  // Check if status is TRIAL
  if (subscription.status !== 'TRIAL') {
    return false;
  }

  // Check if trial has ended
  if (subscription.trialEnd) {
    const now = new Date();
    return new Date(subscription.trialEnd) > now;
  }

  // If no trialEnd date, check currentPeriodEnd (fallback)
  if (subscription.currentPeriodEnd) {
    const now = new Date();
    return new Date(subscription.currentPeriodEnd) > now;
  }

  return false;
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(subscription: Subscription | null): number {
  if (!subscription || !isTrialActive(subscription)) {
    return 0;
  }

  const trialEndDate = subscription.trialEnd 
    ? new Date(subscription.trialEnd)
    : subscription.currentPeriodEnd 
    ? new Date(subscription.currentPeriodEnd)
    : null;

  if (!trialEndDate) {
    return 0;
  }

  const now = new Date();
  const diff = trialEndDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return Math.max(0, daysRemaining);
}

/**
 * Calculate trial end date from start date
 */
export function calculateTrialEndDate(startDate: Date = new Date()): Date {
  return new Date(startDate.getTime() + TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000);
}

