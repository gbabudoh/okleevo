"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { HeroAnimation } from "@/components/hero-animation";
import { FeaturesBentoGrid } from "@/components/features-bento-grid";
import { DashboardPreviewRegion } from "@/components/dashboard-preview-region";

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && session?.user;
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch("/api/public/dashboard-preview")
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data) setConfig(data);
      })
      .catch((err) => console.error("Error loading showcase config:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50" data-ai-landing-page="true">
      {/* Schema Markup (SEO, GEO & Local Search) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Okleevo",
              "operatingSystem": "All",
              "applicationCategory": "BusinessApplication",
              "offers": {
                "@type": "Offer",
                "price": "9.99",
                "priceCurrency": "GBP"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "142"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Okleevo",
              "image": "https://okleevo.com/logo.png",
              "priceRange": "£",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "London",
                "addressRegion": "Greater London",
                "postalCode": "EC1A 1BB",
                "addressCountry": "GB"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 51.5074,
                "longitude": -0.1278
              },
              "url": "https://okleevo.com"
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How much does Okleevo cost for UK businesses?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Okleevo costs a flat fee of £9.99 per month for UK SMEs. There are no hidden fees or tier limits, and 10 user seats are included."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Okleevo MTD compliant for UK taxation?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Okleevo is designed specifically for UK SMEs and supports double-entry bookkeeping, VAT tracking, and MTD-compliant reporting structures."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What modules are included in the all-in-one platform?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Okleevo includes 20 integrated business modules, covering Invoicing, CRM, booking calendar, campaigns, tasks, suppliers, inventory, e-signature, video collaboration, and AI tools."
                  }
                }
              ]
            }
          ])
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100" data-ai-nav="true" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12 sm:h-16">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <Image
              src="/logo.png"
              alt="Okleevo"
              width={100}
              height={28}
              className="h-6 sm:h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            <Link href="#home" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link href="#benefits" className="hover:text-gray-900 transition-colors">Benefits</Link>
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="/guide" className="hover:text-gray-900 transition-colors">Guide</Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-semibold text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all active:scale-95"
                style={{ backgroundColor: '#fc6813' }}
              >
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">Go to Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/access"
                  className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 px-2 sm:px-3 py-1.5 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/onboarding"
                  className="text-xs sm:text-sm font-semibold text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all active:scale-95"
                  style={{ backgroundColor: '#fc6813' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 sm:pt-24 pb-10 sm:pb-20 px-4 sm:px-6 relative overflow-hidden" data-ai-section="hero">
        <HeroAnimation />
      </section>

      {/* Interactive Mockup Preview Section */}
      <div data-ai-section="preview">
        <DashboardPreviewRegion initialConfig={config} />
      </div>

      {/* Benefits Section */}
      <section data-ai-section="features">
        <FeaturesBentoGrid />
      </section>

      {/* Regional UK SME Focus (SEO/GEO/Local) */}
      <section className="py-12 bg-white/40 backdrop-blur-sm border-y border-gray-100 print:hidden" data-ai-section="uk-coverage">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 mb-4">
            Proudly Supporting UK Businesses Nationwide
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed mb-6">
            Okleevo's platform is optimized for local UK tax structures, VAT rules, and MTD accounting standards. 
            Empowering small businesses, contractors, and agencies across all major hubs.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-400">
            <span>London</span> • <span>Birmingham</span> • <span>Manchester</span> • <span>Leeds</span> • 
            <span>Glasgow</span> • <span>Sheffield</span> • <span>Liverpool</span> • <span>Newcastle</span> • 
            <span>Bristol</span> • <span>Belfast</span> • <span>Cardiff</span> • <span>Edinburgh</span>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 px-6" data-ai-section="cta" aria-label="Call to Action">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Link
              href="/onboarding"
              className="inline-block px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ backgroundColor: '#fc6813' }}
            >
              Start Your Free Trial Today
            </Link>
            <p className="mt-4 text-gray-600">
              No credit card required • 14-day free trial • 10 User Seats Included
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-300" data-ai-footer="true" aria-label="Site Footer">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Image 
              src="/logo.png" 
              alt="Okleevo" 
              width={150} 
              height={40} 
              className="h-10 w-auto" 
            />
          </Link>
          <p className="text-gray-500 mb-4">Everything included. 10 User Seats Included.</p>
          <p className="text-sm text-indigo-400 font-bold mb-8">
            10 seats included – allows multiple users on one account, suitable for SMEs with small or large teams.
          </p>
          <p className="text-gray-400 mb-6">
            The all-in-one business platform designed specifically for UK SMEs
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/guide" className="hover:text-white transition-colors">User Guide</Link>
            <Link 
              href={isLoggedIn ? "/dashboard/helpdesk" : "/support"} 
              className="hover:text-white transition-colors"
            >
              Support
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            © 2025 Okleevo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
