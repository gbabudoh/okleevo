"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HelpCircle, Mail, MessageSquare, Book, Search, Phone, Clock, CheckCircle } from "lucide-react";

export default function SupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = status === "authenticated" && session?.user;

  // Redirect logged-in users to dashboard helpdesk
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    if (isLoggedIn) {
      router.push("/dashboard/helpdesk");
    }
  }, [isLoggedIn, status, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if redirecting
  if (isLoggedIn) {
    return null;
  }
  const faqs = [
    {
      question: "How do I get started with Okleevo?",
      answer: "Simply sign up for a free 14-day trial. No credit card required. You'll have full access to all 20 modules during your trial period.",
    },
    {
      question: "What happens after my 14-day trial?",
      answer: "After your trial ends, you'll need to subscribe to a paid plan to continue using Okleevo. We'll send you reminders before your trial expires.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.",
    },
    {
      question: "How do I add team members?",
      answer: "Only account owners can add team members. Go to Settings > Team, then click 'Add Employee'. Each team member uses one seat from your subscription.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use enterprise-grade security including encryption, regular backups, and UK-based data centers. We're GDPR compliant and take data protection seriously.",
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export your data at any time. Contact support for assistance with bulk data exports or use the export features available in each module.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards through our secure Stripe payment processor. All payments are processed securely and in compliance with PCI DSS standards.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for new subscriptions. If you're not satisfied within the first 30 days, contact us for a full refund.",
    },
  ];

  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@okleevo.com",
      responseTime: "Within 24 hours",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageSquare,
      title: "Helpdesk",
      description: "Submit a support ticket",
      contact: "Available in dashboard",
      responseTime: "Within 12 hours",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Book,
      title: "Documentation",
      description: "Browse our guides",
      contact: "Coming soon",
      responseTime: "Self-service",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Okleevo" className="h-10 w-auto" />
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 mb-6">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Support Center
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're here to help! Get assistance with your Okleevo account, features, billing, and more.
            </p>
          </div>

          {/* Support Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border-2 border-gray-100"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Contact:</strong> {option.contact}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{option.responseTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Search className="w-8 h-8 text-orange-600" />
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/dashboard/helpdesk"
                className="flex items-center gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Submit a Ticket</h3>
                  <p className="text-sm text-gray-600">Create a support ticket from your dashboard</p>
                </div>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Account Settings</h3>
                  <p className="text-sm text-gray-600">Manage your subscription and preferences</p>
                </div>
              </Link>

              <a
                href="mailto:support@okleevo.com"
                className="flex items-center gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-sm text-gray-600">support@okleevo.com</p>
                </div>
              </a>

              <Link
                href="/pricing"
                className="flex items-center gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">View Pricing</h3>
                  <p className="text-sm text-gray-600">See our plans and features</p>
                </div>
              </Link>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-16 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">Still Need Help?</h2>
            <p className="text-xl mb-8 text-white/90">
              Our support team is ready to assist you. Get in touch and we'll respond as soon as possible.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Email Support</h3>
                </div>
                <a
                  href="mailto:support@okleevo.com"
                  className="text-lg hover:underline"
                >
                  support@okleevo.com
                </a>
                <p className="text-sm text-white/80 mt-2">Response within 24 hours</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Support Hours</h3>
                </div>
                <p className="text-lg">Monday - Friday</p>
                <p className="text-lg">9:00 AM - 6:00 PM GMT</p>
                <p className="text-sm text-white/80 mt-2">UK-based support team</p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

