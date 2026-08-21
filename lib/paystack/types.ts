export type PaystackCurrency = 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'USD';
export type PaystackPlanTier = 'STARTER' | 'GROWTH' | 'SCALE';
export type BillingPeriod = 'monthly' | 'annual';

/**
 * Standard Tier Pricing Matrix for Paystack (Amounts in base units, converted to sub-units for Paystack).
 * Starter: ~$19/mo | Growth: ~$49/mo | Scale: ~$99/mo with localized parity.
 */
export const PAYSTACK_PRICING: Record<
  PaystackCurrency,
  Record<PaystackPlanTier, { monthly: number; annual: number; symbol: string; name: string }>
> = {
  NGN: {
    STARTER: { monthly: 25000, annual: 250000, symbol: '₦', name: 'Nigerian Naira' },
    GROWTH:  { monthly: 65000, annual: 650000, symbol: '₦', name: 'Nigerian Naira' },
    SCALE:   { monthly: 130000, annual: 1300000, symbol: '₦', name: 'Nigerian Naira' },
  },
  GHS: {
    STARTER: { monthly: 250, annual: 2500, symbol: 'GH₵', name: 'Ghanaian Cedi' },
    GROWTH:  { monthly: 650, annual: 6500, symbol: 'GH₵', name: 'Ghanaian Cedi' },
    SCALE:   { monthly: 1300, annual: 13000, symbol: 'GH₵', name: 'Ghanaian Cedi' },
  },
  KES: {
    STARTER: { monthly: 2500, annual: 25000, symbol: 'KSh', name: 'Kenyan Shilling' },
    GROWTH:  { monthly: 6500, annual: 65000, symbol: 'KSh', name: 'Kenyan Shilling' },
    SCALE:   { monthly: 13000, annual: 130000, symbol: 'KSh', name: 'Kenyan Shilling' },
  },
  ZAR: {
    STARTER: { monthly: 350, annual: 3500, symbol: 'R', name: 'South African Rand' },
    GROWTH:  { monthly: 900, annual: 9000, symbol: 'R', name: 'South African Rand' },
    SCALE:   { monthly: 1800, annual: 18000, symbol: 'R', name: 'South African Rand' },
  },
  USD: {
    STARTER: { monthly: 19, annual: 190, symbol: '$', name: 'US Dollar' },
    GROWTH:  { monthly: 49, annual: 490, symbol: '$', name: 'US Dollar' },
    SCALE:   { monthly: 99, annual: 990, symbol: '$', name: 'US Dollar' },
  },
};
