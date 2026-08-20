"use client";

import { useSession } from "next-auth/react";
import { EnterpriseNav } from "@/components/landing/enterprise-nav";
import { EnterpriseHero } from "@/components/landing/enterprise-hero";
import { InteractiveDashboardDemo } from "@/components/landing/interactive-dashboard-demo";
import { TelemetryStrip } from "@/components/landing/telemetry-strip";
import { EnterpriseBento } from "@/components/landing/enterprise-bento";
import { WorkflowSimulator } from "@/components/landing/workflow-simulator";
import { TrustMarquee } from "@/components/landing/trust-marquee";
import { EnterpriseFaqFooter } from "@/components/landing/enterprise-faq-footer";

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && Boolean(session?.user);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white" data-ai-landing-page="true">
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

      {/* Enterprise Nav Bar */}
      <EnterpriseNav isLoggedIn={isLoggedIn} />

      {/* Main Homepage Sections */}
      <main>
        {/* Enterprise Hero Section */}
        <EnterpriseHero />

        {/* Live Interactive Floating Dashboard Demo Flow */}
        <InteractiveDashboardDemo />

        {/* Enterprise Telemetry Strip */}
        <TelemetryStrip />

        {/* Spotlight Enterprise Bento Grid */}
        <EnterpriseBento />

        {/* Step-by-Step Workflow Simulator */}
        <WorkflowSimulator />

        {/* Social Proof & Testimonials */}
        <TrustMarquee />
      </main>

      {/* Enterprise FAQ & Dark Footer */}
      <EnterpriseFaqFooter />
    </div>
  );
}
