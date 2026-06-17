import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Get full access to all 20 business tools for UK SMEs at just £9.99/month. 10 user seats included. No hidden fees. Start your 14-day free trial today.',
  openGraph: {
    title: 'Simple, Transparent Pricing | Okleevo',
    description: 'All 20 business tools for UK SMEs at just £9.99/month. 10 user seats included.',
  }
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
