import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Module Catalog & User Guide',
  description: "Explore the full catalog of Okleevo's 20 integrated modules, including Invoicing, CRM, MTD Accounting, Tasks, E-Signature, and local UK business tools.",
  openGraph: {
    title: 'Okleevo Module Catalog & User Guide',
    description: 'Get a comprehensive overview of every tool designed to transform your business operations.',
  }
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
