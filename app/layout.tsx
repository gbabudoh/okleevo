import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerCleaner } from "@/components/ServiceWorkerCleaner";
import Analytics from "@/components/Analytics";
import PublicMobileNav from "@/components/navigation/PublicMobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    template: '%s | Okleevo',
    default: 'Okleevo - 20 Business Tools, One Simple Platform',
  },
  description: "The all-in-one platform for UK SMEs. 20 integrated modules including invoicing, CRM, AI tools, and more. Just £9.99/month.",
  keywords: [
    "SME", "UK business", "SaaS", "business tools", "invoicing", "CRM", "AI tools", "ERP", "small business software",
    "UK business software", "London SME tools", "VAT invoicing UK", "MTD compliant bookkeeping", 
    "UK client database", "Manchester small business tools", "Birmingham business software", "Leeds SaaS for SMEs"
  ],
  authors: [{ name: "Okleevo Team" }],
  creator: "Okleevo",
  publisher: "Okleevo",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    title: "Okleevo - 20 Business Tools, One Simple Platform",
    description: "The all-in-one platform for UK SMEs. 20 integrated modules including invoicing, CRM, AI tools, and more.",
    siteName: "Okleevo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Okleevo - 20 Business Tools, One Simple Platform",
    description: "The all-in-one platform for UK SMEs. 20 integrated modules including invoicing, CRM, AI tools, and more.",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        <Script
          id="matomo-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _paq = window._paq = window._paq || [];
              /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
              _paq.push(['trackPageView']);
              _paq.push(['enableLinkTracking']);
              (function() {
                var u="//matomo.feendesk.com/";
                _paq.push(['setTrackerUrl', u+'matomo.php']);
                _paq.push(['setSiteId', '3']);
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
              })();
            `,
          }}
        />
        
        {/* Global Organization Schema Markup for SEO/GEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Okleevo",
              "url": "https://okleevo.com",
              "logo": "https://okleevo.com/logo.png",
              "description": "The all-in-one platform for UK SMEs. 20 integrated modules including invoicing, CRM, MTD bookkeeping, and AI tools for just £9.99/month.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "GB"
              },
              "sameAs": [
                "https://twitter.com/okleevo",
                "https://github.com/gbabudoh/okleevo"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SessionProvider>
            <ServiceWorkerCleaner />
            {children}
            <PublicMobileNav />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
