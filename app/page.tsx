"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { HeroAnimation } from "@/components/hero-animation";
import { 
  PiggyBank, 
  Zap, 
  Target, 
  Rocket, 
  Users, 
  Shield, 
  BarChart3, 
  GraduationCap, 
  Sparkles 
} from "lucide-react";

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
              <img src="/logo.png" alt="Okleevo" className="h-10 w-auto" />
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
      <section id="benefits" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why SMEs Choose Okleevo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop paying for multiple subscriptions. Get everything you need in one powerful platform designed specifically for UK small businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: PiggyBank,
                title: "Save Money",
                description: "Replace 5-10 separate tools with one affordable subscription. Save up to £500/month on software costs.",
                color: "from-emerald-400 to-emerald-600"
              },
              {
                icon: Zap,
                title: "Save Time",
                description: "No more switching between apps. Everything in one place means faster workflows and less frustration.",
                color: "from-blue-400 to-blue-600"
              },
              {
                icon: Target,
                title: "Stay Organized",
                description: "All your business data in one unified system. No more scattered information across multiple platforms.",
                color: "from-purple-400 to-purple-600"
              },
              {
                icon: Rocket,
                title: "Scale Easily",
                description: "Start with what you need, activate more modules as you grow. No complex migrations or new tools to learn.",
                color: "from-orange-400 to-orange-600"
              },
              {
                icon: Users,
                title: "Better Collaboration",
                description: "Your whole team works from the same platform. Share data, tasks, and insights seamlessly.",
                color: "from-pink-400 to-pink-600"
              },
              {
                icon: Shield,
                title: "UK-Based & Secure",
                description: "GDPR compliant, UK data centers, and enterprise-grade security. Your business data stays protected.",
                color: "from-indigo-400 to-indigo-600"
              },
              {
                icon: BarChart3,
                title: "Real-Time Insights",
                description: "Unified dashboard shows your entire business at a glance. Make informed decisions faster.",
                color: "from-teal-400 to-teal-600"
              },
              {
                icon: GraduationCap,
                title: "Easy to Use",
                description: "Intuitive interface designed for busy business owners. Get started in minutes, not weeks.",
                color: "from-amber-400 to-amber-600"
              },
              {
                icon: Sparkles,
                title: "AI-Powered",
                description: "Built-in AI tools for content creation, note-taking, and automation. Work smarter, not harder.",
                color: "from-rose-400 to-rose-600"
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-primary-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <benefit.icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
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
            <img src="/logo.png" alt="Okleevo" className="h-10 w-auto" />
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
