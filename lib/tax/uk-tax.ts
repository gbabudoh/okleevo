// Shared UK statutory tax formulas (2025/26 rates) — the single source of truth
// for this app's Corporation Tax, PAYE/NI, and Self Assessment math. Used by
// both the taxation API (app/api/taxation/route.ts) and the Taxation dashboard
// (app/dashboard/taxation/page.tsx) so the same input always produces the same
// answer everywhere it's shown — duplicated copies of this logic previously
// drifted and disagreed with each other.
//
// These are simplified statutory calculators for estimation purposes (no
// capital allowances, disallowable expenses, R&D relief, associated-company
// rules, or full self-employment/dividend tax interaction). They are not a
// substitute for an accountant's computation before HMRC filing.

export interface CorporationTaxResult {
  tax: number;
  rateLabel: string;
}

/**
 * UK Corporation Tax (post-April 2023 rules), assuming no associated
 * companies and no exempt distributions:
 * - profit <= £50,000: 19% (small profits rate)
 * - profit >= £250,000: 25% (main rate)
 * - in between: 25% less Marginal Relief = (250,000 - profit) x 3/200
 */
export function calculateCorporationTax(profit: number): CorporationTaxResult {
  if (!Number.isFinite(profit) || profit <= 0) return { tax: 0, rateLabel: '19%' };
  if (profit <= 50000) return { tax: profit * 0.19, rateLabel: '19%' };
  if (profit >= 250000) return { tax: profit * 0.25, rateLabel: '25%' };
  const marginalRelief = (250000 - profit) * (3 / 200);
  const tax = profit * 0.25 - marginalRelief;
  const effectiveRate = (tax / profit) * 100;
  return { tax, rateLabel: `${effectiveRate.toFixed(1)}% (Marginal Relief)` };
}

// UK 2025/26 Income Tax & National Insurance rates and thresholds.
export const UK_TAX_RATES = {
  personalAllowance: 12570,
  // Personal Allowance tapers by £1 for every £2 of income over £100,000,
  // reaching £0 at £125,140.
  personalAllowanceTaperStart: 100000,
  personalAllowanceTaperEnd: 125140,
  basicRateLimit: 37700,
  higherRateLimit: 125140,
  basicRate: 0.20,
  higherRate: 0.40,
  additionalRate: 0.45,
  // Employee NI Class 1 (2025/26)
  niPrimaryThreshold: 12570, // Annual
  niUpperLimit: 50270, // Annual
  niEmployeeRate: 0.08, // 8% (reduced from 10% in April 2024)
  niEmployeeUpperRate: 0.02, // 2%
  // Employer NI Class 1 (2025/26)
  niSecondaryThreshold: 9100, // Annual (from April 2025)
  niEmployerRate: 0.15, // 15% (increased from 13.8% in April 2025)
  // Self-employed NI Class 4 (2025/26) — same lower/upper limits as Class 1
  niClass4LowerLimit: 12570,
  niClass4UpperLimit: 50270,
  niClass4Rate: 0.09,
};

/** Personal Allowance after the >£100k taper (reaches £0 at £125,140). */
export function taperedPersonalAllowance(annualIncome: number): number {
  const { personalAllowance, personalAllowanceTaperStart } = UK_TAX_RATES;
  if (annualIncome <= personalAllowanceTaperStart) return personalAllowance;
  const reduction = Math.floor((annualIncome - personalAllowanceTaperStart) / 2);
  return Math.max(0, personalAllowance - reduction);
}

/** Monthly PAYE income tax for a given annual salary, with the >£100k allowance taper applied. */
export function calculateMonthlyPAYE(annualSalary: number): number {
  const allowance = taperedPersonalAllowance(annualSalary);
  const taxable = Math.max(0, annualSalary - allowance);
  let annualTax = 0;

  if (taxable <= UK_TAX_RATES.basicRateLimit) {
    annualTax = taxable * UK_TAX_RATES.basicRate;
  } else if (taxable <= UK_TAX_RATES.higherRateLimit) {
    annualTax = (UK_TAX_RATES.basicRateLimit * UK_TAX_RATES.basicRate) +
                ((taxable - UK_TAX_RATES.basicRateLimit) * UK_TAX_RATES.higherRate);
  } else {
    annualTax = (UK_TAX_RATES.basicRateLimit * UK_TAX_RATES.basicRate) +
                ((UK_TAX_RATES.higherRateLimit - UK_TAX_RATES.basicRateLimit) * UK_TAX_RATES.higherRate) +
                ((taxable - UK_TAX_RATES.higherRateLimit) * UK_TAX_RATES.additionalRate);
  }
  return Math.round(annualTax / 12 * 100) / 100;
}

/** Monthly employee NI (Class 1) for a given annual salary. */
export function calculateEmployeeNI(annualSalary: number): number {
  let annualNI = 0;
  if (annualSalary > UK_TAX_RATES.niPrimaryThreshold) {
    const upperEarnings = Math.min(annualSalary, UK_TAX_RATES.niUpperLimit);
    annualNI = (upperEarnings - UK_TAX_RATES.niPrimaryThreshold) * UK_TAX_RATES.niEmployeeRate;
    if (annualSalary > UK_TAX_RATES.niUpperLimit) {
      annualNI += (annualSalary - UK_TAX_RATES.niUpperLimit) * UK_TAX_RATES.niEmployeeUpperRate;
    }
  }
  return Math.round(annualNI / 12 * 100) / 100;
}

/** Monthly employer NI (Class 1) for a given annual salary. */
export function calculateEmployerNI(annualSalary: number): number {
  let annualNI = 0;
  if (annualSalary > UK_TAX_RATES.niSecondaryThreshold) {
    annualNI = (annualSalary - UK_TAX_RATES.niSecondaryThreshold) * UK_TAX_RATES.niEmployerRate;
  }
  return Math.round(annualNI / 12 * 100) / 100;
}

/**
 * Self Assessment income tax + Class 4 NI on taxable income (after Personal
 * Allowance and expenses have already been deducted by the caller).
 */
export function calculateSelfAssessmentTaxDue(taxableIncome: number): number {
  let tax = 0;
  if (taxableIncome <= UK_TAX_RATES.basicRateLimit) {
    tax = taxableIncome * UK_TAX_RATES.basicRate;
  } else if (taxableIncome <= UK_TAX_RATES.higherRateLimit) {
    tax = (UK_TAX_RATES.basicRateLimit * UK_TAX_RATES.basicRate) +
          ((taxableIncome - UK_TAX_RATES.basicRateLimit) * UK_TAX_RATES.higherRate);
  } else {
    tax = (UK_TAX_RATES.basicRateLimit * UK_TAX_RATES.basicRate) +
          ((UK_TAX_RATES.higherRateLimit - UK_TAX_RATES.basicRateLimit) * UK_TAX_RATES.higherRate) +
          ((taxableIncome - UK_TAX_RATES.higherRateLimit) * UK_TAX_RATES.additionalRate);
  }
  const ni = taxableIncome > UK_TAX_RATES.niClass4LowerLimit
    ? (Math.min(taxableIncome, UK_TAX_RATES.niClass4UpperLimit) - UK_TAX_RATES.niClass4LowerLimit) * UK_TAX_RATES.niClass4Rate
    : 0;
  return Math.round(tax + ni);
}

export interface InvoiceLineItemRow { description?: string; quantity?: number; rate?: number; vatRate?: number }

/**
 * Sums real per-line VAT off an invoice's stored items — items created before
 * vatRate existed default to 20% (the same assumption the whole app made
 * everywhere before this field existed), so old invoices don't silently drop
 * to £0 VAT. Some older/seeded rows have items double-JSON-encoded (a string
 * containing JSON, not a native array) — parse defensively rather than
 * silently treating them as having no items at all.
 */
export function invoiceOutputVAT(itemsRaw: unknown): number {
  let items = itemsRaw;
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch { return 0; }
  }
  if (!Array.isArray(items)) return 0;
  return (items as InvoiceLineItemRow[]).reduce((sum, item) => {
    const net = (item.quantity || 0) * (item.rate || 0);
    const rate = item.vatRate ?? 20;
    return sum + net * (rate / 100);
  }, 0);
}
