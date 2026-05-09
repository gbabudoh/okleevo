# Okleevo Internationalization (i18n) & Global Expansion Strategy

## 1. Executive Summary
Okleevo is currently optimized for the UK market (GBP, VAT, English). To scale globally, the platform must evolve into a location-aware system that dynamically adapts to a user's currency, tax jurisdiction, and language without increasing operational complexity for the SME.

## 2. Phase 1: Monetary & Tax Infrastructure (The Foundation)
Before translating the UI, the backend must support multi-dimensional data.

### A. Multi-Currency Support
- **Base vs. Transaction Currency:** The system should maintain a `baseCurrency` (for business reporting) and allow `transactionCurrency` (for specific invoices/purchases).
- **Exchange Rate Engine:** Integrate with an API (e.g., Fixer.io or Open Exchange Rates) to provide daily mid-market rates for automated conversions.
- **Prisma Schema Update:** Add `currencyCode` fields to `Invoice`, `Product`, and `Transaction` models.

### B. Dynamic Tax Engine
- **Current State:** Hardcoded VAT logic.
- **Future State:** A "Tax Rule" engine based on the `BusinessLocation`.
    - **VAT (UK/EU):** Percentage-based with registration number tracking.
    - **Sales Tax (US):** Destination-based tax calculation (potential integration with TaxJar or Avalara for accuracy).
    - **GST (India/Australia/Canada):** Support for multi-component taxes (e.g., SGST + CGST).

## 3. Phase 2: Localization (L10n)
Adapting the "Feel" of the application.

### A. UI Translation
- **Framework:** Implement `next-intl` or `react-i18next`.
- **Strategy:** Move all hardcoded strings into JSON translation files (`en.json`, `fr.json`, `yo.json`, etc.).
- **Right-to-Left (RTL):** Ensure CSS layouts support RTL for future Arabic/Hebrew expansion.

### B. Regional Formatting
- **Date/Time:** Use `Intl.DateTimeFormat` to handle `DD/MM/YYYY` (UK/Global) vs `MM/DD/YYYY` (US).
- **Numbers/Currencies:** Handle different decimal separators (e.g., `1,234.56` in UK vs `1.234,56` in Germany).

## 4. Phase 3: Regional Compliance & Hosting
- **Data Sovereignty:** Investigate region-specific hosting (e.g., AWS/Vercel regions in Africa, Asia, or USA) for latency and legal compliance (GDPR, CCPA, POPIA).
- **Legal Documents:** Dynamically generate Terms of Service and Privacy Policies based on the user's jurisdiction.

## 5. Phase 4: Payment Ecosystem Expansion
Integrate regional payment giants to handle localized payment methods beyond Stripe:
- **Africa:** Flutterwave / Paystack (for Mobile Money, Bank Transfers).
- **LATAM:** Mercado Pago.
- **Asia:** Razorpay / AliPay.

## 6. Implementation Roadmap (Technical Steps)
1. **Refactor Invoicing:** Move from `amount` (Number) to `amount` + `currency` (Object/String).
2. **Context-Aware Formatting:** Create a `useLocalization` hook to wrap all date and number displays.
3. **Middleware Locale Detection:** Detect user location via IP or Browser settings and suggest the appropriate locale during onboarding.

---
**Status:** Strategic Draft
**Date:** May 2026
