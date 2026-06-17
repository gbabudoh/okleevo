import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support Center',
  description: "Need help with your Okleevo account, billing, or features? Reach out to our UK-based support team or search our comprehensive FAQs.",
  openGraph: {
    title: 'Okleevo Support Center',
    description: 'Get help with your Okleevo account. Browse guides, submit support tickets, or search FAQs.',
  }
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
