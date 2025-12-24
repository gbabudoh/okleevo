/**
 * Business Size Utilities
 * Maps business size to seats, tiers, and pricing
 */

export type BusinessSize = '1-5' | '6-10' | '11-25' | '26-50' | '50+';

export interface BusinessSizeConfig {
  size: BusinessSize;
  minSeats: number;
  maxSeats: number;
  tier: 1 | 2 | 3;
  defaultSeatCount: number;
}

export const BUSINESS_SIZE_CONFIGS: Record<BusinessSize, BusinessSizeConfig> = {
  '1-5': {
    size: '1-5',
    minSeats: 1,
    maxSeats: 5,
    tier: 1,
    defaultSeatCount: 1,
  },
  '6-10': {
    size: '6-10',
    minSeats: 6,
    maxSeats: 10,
    tier: 1,
    defaultSeatCount: 6,
  },
  '11-25': {
    size: '11-25',
    minSeats: 11,
    maxSeats: 25,
    tier: 2,
    defaultSeatCount: 11,
  },
  '26-50': {
    size: '26-50',
    minSeats: 26,
    maxSeats: 50,
    tier: 2,
    defaultSeatCount: 26,
  },
  '50+': {
    size: '50+',
    minSeats: 51,
    maxSeats: 999, // Unlimited for enterprise
    tier: 3,
    defaultSeatCount: 51,
  },
};

/**
 * Get configuration for a business size
 */
export function getBusinessSizeConfig(size: string): BusinessSizeConfig | null {
  if (size in BUSINESS_SIZE_CONFIGS) {
    return BUSINESS_SIZE_CONFIGS[size as BusinessSize];
  }
  return null;
}

/**
 * Get tier based on business size
 */
export function getTierFromBusinessSize(size: string): 1 | 2 | 3 {
  const config = getBusinessSizeConfig(size);
  return config?.tier || 1;
}

/**
 * Get max seats based on business size
 */
export function getMaxSeatsFromBusinessSize(size: string): number {
  const config = getBusinessSizeConfig(size);
  return config?.maxSeats || 10;
}

/**
 * Get default seat count based on business size
 */
export function getDefaultSeatCount(size: string): number {
  const config = getBusinessSizeConfig(size);
  return config?.defaultSeatCount || 1;
}

