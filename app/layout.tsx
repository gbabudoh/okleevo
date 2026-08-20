import type { Metadata, Viewport } from "next";
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
    default: 'Okleevo — All-in-One Virtual HQ & Business Operating Platform',
  },
  description: "The unified business operating platform for modern SMEs. Seamlessly manage team messaging, video meetings, CRM pipelines, mail engine, booking pages, and task boards in one place.",
  keywords: [
    "SME", "Virtual HQ", "Business Operating System", "Team Messaging", "Video Meetings", "CRM Pipeline", 
    "Booking Pages", "Mail Engine", "Task Boards", "E-Signatures", "SaaS", "Small Business Software", "UK Business Software"
  ],
  authors: [{ name: "Okleevo Team" }],
  creator: "Okleevo",
  publisher: "Okleevo",
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/?geo=us',
      'en-GB': '/?geo=uk',
      'en-CA': '/?geo=ca',
      'en-AU': '/?geo=au',
      'en-IE': '/?geo=ie',
      'x-default': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    title: "Okleevo — All-in-One Virtual HQ & Business Operating Platform",
    description: "The unified business operating platform for modern SMEs. Seamlessly manage team messaging, video meetings, CRM pipelines, mail engine, booking pages, and task boards in one place.",
    siteName: "Okleevo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Okleevo — All-in-One Virtual HQ & Business Operating Platform",
    description: "The unified business operating platform for modern SMEs. Seamlessly manage team messaging, video meetings, CRM pipelines, mail engine, booking pages, and task boards in one place.",
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Okleevo",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f97316",
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://okleevo.com/#organization",
      "name": "Okleevo",
      "url": "https://okleevo.com",
      "logo": "https://okleevo.com/icon-512.png",
      "description": "The unified Virtual HQ and business operating system for modern SMEs.",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@okleevo.com",
        "contactType": "customer support",
        "availableLanguage": ["English"]
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://okleevo.com/#software",
      "name": "Okleevo",
      "operatingSystem": "Web, macOS, Windows, iOS, Android, Cloud",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "39.00",
        "priceCurrency": "USD",
        "priceValidUntil": "2030-12-31",
        "availability": "https://schema.org/OnlineOnly"
      },
      "description": "All-in-one Virtual HQ & Business Operating Platform with team collaboration, CRM pipelines, booking pages, mail engine, and task management.",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "142",
        "bestRating": "5",
        "worstRating": "1"
      },
      "featureList": [
        "WebRTC Audio & Video Meetings",
        "Multi-channel Team Chat",
        "CRM Deal Pipeline",
        "Calendar Booking Pages",
        "Mail Engine & Automated Dispatches",
        "Agile Kanban Task Boards",
        "Legally Compliant E-Signatures",
        "Executive KPI Dashboard"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://okleevo.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Okleevo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Okleevo is an all-in-one Virtual HQ and business operating platform for SMEs, combining team messaging, video conferencing, CRM, booking pages, task boards, and transactional email in one unified workspace."
          }
        },
        {
          "@type": "Question",
          "name": "How much does Okleevo cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Okleevo starts at $39/month for the Starter Plan, which includes 5 team seats, unlimited collaboration, video calls, CRM pipelines, and mail dispatch with a 14-day free trial."
          }
        },
        {
          "@type": "Question",
          "name": "Can Okleevo replace Slack, Zoom, and Calendly?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Okleevo includes built-in team chat, HD video meetings, screen sharing, and client booking links to consolidate fragmented software into one platform."
          }
        }
      ]
    }
  ]
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
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
              "description": "The all-in-one platform for UK SMEs. 23 integrated modules including invoicing, CRM, staff collaboration, Mail Engine, MTD bookkeeping, and AI tools for just £9.99/month.",
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
