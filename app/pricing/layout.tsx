import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Get full access to all business tools for SMEs starting at just $19/month. User seats included. No hidden fees. Start your free trial today.',
  openGraph: {
    title: 'Simple, Transparent Pricing | Okleevo',
    description: 'All business tools for global SMEs starting at just $19/month.',
  }
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
