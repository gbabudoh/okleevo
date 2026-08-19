"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { HeroAnimation } from "@/components/hero-animation";
import { FeaturesBentoGrid } from "@/components/features-bento-grid";
import { ProductDemoSimulator } from "@/components/product-demo/ProductDemoSimulator";
import { ScrollFeatureFlow } from "@/components/scroll-feature-flow";
import { TrustBadges } from "@/components/trust-badges";

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && session?.user;

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
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Starter Workspace",
                  "price": "49",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "name": "Growth Workspace",
                  "price": "99",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "name": "Scale Workspace",
                  "price": "199",
                  "priceCurrency": "USD"
                }
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "142"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How much does Okleevo cost?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Okleevo starts at $49/month (Starter, 5 seats), with Growth at $99/month (12 seats) and Scale at $199/month (25 seats). Annual billing is discounted. Additional seats are billed per seat beyond each plan's allotment."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do my clients need an Okleevo account to book a call or join a meeting?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Clients book through your branded public booking page, upload files directly to an isolated, malware-scanned storage bucket, and join the video call with a one-time access code emailed to them — no account, login, or download required."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Okleevo built for distributed, global teams?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Okleevo is a borderless workspace: team chat and voice huddles, timezone-aware async task boards, AI meeting transcription, and a lean CRM pipeline, all in one platform for remote-first teams and global agencies."
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

      {/* Interactive Two-Layer Product Demo */}
      <section className="py-16 sm:py-20 px-4 sm:px-6" data-ai-section="preview">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            One workspace. Two completely separate worlds.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Your team&apos;s private HQ and your client&apos;s booking experience never overlap — see both below.
          </p>
        </div>
        <ProductDemoSimulator />
      </section>

      {/* Scroll-driven feature pipelines */}
      <section className="py-16 sm:py-20 bg-white/40 backdrop-blur-sm border-y border-gray-100" data-ai-section="pipelines">
        <ScrollFeatureFlow />
      </section>

      {/* Benefits Section */}
      <section data-ai-section="features">
        <FeaturesBentoGrid />
      </section>

      {/* Trust & Infrastructure */}
      <section className="py-16 px-6 bg-white/40 backdrop-blur-sm" data-ai-section="trust">
        <TrustBadges />
      </section>

      {/* Global Coverage (SEO/GEO) */}
      <section className="py-12 bg-white/40 backdrop-blur-sm border-y border-gray-100 print:hidden" data-ai-section="global-coverage">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 mb-4">
            Trusted by Remote-First Teams Across 40+ Countries
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed mb-6">
            Okleevo is built for distributed teams, digital agencies, and global consultancies — no regional
            lock-in, no local-only pricing. One workspace, wherever your team and clients are.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-400">
            <span>New York</span> • <span>London</span> • <span>Toronto</span> • <span>Berlin</span> •
            <span>Singapore</span> • <span>Sydney</span> • <span>Dubai</span> • <span>Lagos</span> •
            <span>São Paulo</span> • <span>Nairobi</span> • <span>Manila</span> • <span>Remote-First</span>
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
              Start Your Borderless Workspace →
            </Link>
            <p className="mt-4 text-gray-600">
              No credit card required • 14-day free trial • 5 seats included on Starter
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
          <p className="text-gray-500 mb-4">Team chat, async projects, and client bookings — all in one workspace.</p>
          <p className="text-sm text-indigo-400 font-bold mb-8">
            Starts at 5 seats – scale seat-by-seat as your distributed team grows.
          </p>
          <p className="text-gray-400 mb-6">
            The borderless workspace for distributed teams and global agencies
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
