"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { HeroAnimation } from "@/components/hero-animation";
import { FeaturesBentoGrid } from "@/components/features-bento-grid";

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && session?.user;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="Okleevo" 
                width={150} 
                height={40} 
                className="h-10 w-auto" 
              />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#home" className="text-gray-700 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link href="#benefits" className="text-gray-700 hover:text-primary-600 transition-colors">
                Benefits
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="px-6 py-2.5 rounded-full text-white font-medium hover:shadow-lg transition-all hover-lift"
                    style={{ backgroundColor: '#fc6813' }}
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/access" 
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/onboarding" 
                    className="px-6 py-2.5 rounded-full text-white font-medium hover:shadow-lg transition-all hover-lift"
                    style={{ backgroundColor: '#fc6813' }}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <HeroAnimation />
      </section>

      {/* Benefits Section */}
      <FeaturesBentoGrid />
      
      {/* CTA */}
      <section className="py-20 px-6">
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
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-300">
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
          <p className="text-gray-400 mb-6">
            The all-in-one business platform designed specifically for UK SMEs
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link 
              href={isLoggedIn ? "/dashboard/helpdesk" : "/support"} 
              className="hover:text-white transition-colors"
            >
              Support
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            © 2024 Okleevo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
