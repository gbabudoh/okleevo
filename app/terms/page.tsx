import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Scale, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - Okleevo",
  description: "Okleevo Terms of Service - Legal terms and conditions",
};

export default function TermsPage() {
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-6">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Content Sections */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                1. Agreement to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing or using Okleevo ("the Platform", "the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These Terms apply to all users of the Platform, including without limitation users who are browsers, customers, merchants, and contributors of content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Okleevo is an all-in-one business management platform designed for UK SMEs, providing:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>20 integrated business modules (invoicing, CRM, accounting, etc.)</li>
                <li>Cloud-based data storage and management</li>
                <li>Team collaboration and multi-user access</li>
                <li>AI-powered content generation and automation</li>
                <li>Payment processing and subscription management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Account Registration and Security
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
                3.1 Account Creation
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                To use our services, you must:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Be at least 18 years old and have the legal capacity to enter into contracts</li>
                <li>Be authorized to represent your business or organization</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                3.2 Account Security
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring all team members comply with these Terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Subscription and Payment Terms
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
                4.1 Free Trial
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer a 14-day free trial with full access to all features. No credit card is required to start your trial. The trial period begins when you create your account.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                4.2 Subscription Plans
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                After the trial period, you must subscribe to a paid plan to continue using the Service. Subscription fees are:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Charged monthly or annually based on your selected plan</li>
                <li>Billed in advance on a recurring basis</li>
                <li>Based on the number of active users (seats) in your account</li>
                <li>Subject to change with 30 days' notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                4.3 Payment Processing
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Payments are processed securely through Stripe. By providing payment information, you authorize us to charge your payment method for all fees due.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                4.4 Cancellation and Refunds
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. We offer a 30-day money-back guarantee for new subscriptions if you're not satisfied.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Acceptable Use
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Transmit any harmful code, viruses, or malicious software</li>
                <li>Attempt to gain unauthorized access to the Platform or other accounts</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Resell, sublicense, or redistribute the Service</li>
                <li>Reverse engineer, decompile, or disassemble the Platform</li>
                <li>Use the Service to send spam, phishing, or fraudulent communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Platform, including its original content, features, and functionality, is owned by Okleevo and is protected by UK and international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of all data and content you upload to the Platform. By using the Service, you grant us a limited, non-exclusive license to use, store, and process your data solely to provide and improve the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Data and Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your use of the Service is also governed by our Privacy Policy. We are committed to protecting your data and comply with GDPR and UK data protection laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for ensuring that any data you upload complies with applicable laws and that you have the right to use and share such data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Service Availability and Modifications
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We strive to maintain high availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Scheduled maintenance and updates</li>
                <li>Technical issues or failures</li>
                <li>Force majeure events</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>The Service is provided "as is" without warranties of any kind</li>
                <li>We are not liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount you paid in the 12 months preceding the claim</li>
                <li>We are not responsible for data loss, though we maintain regular backups</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless Okleevo, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any rights of another.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may terminate or suspend your account immediately, without prior notice, if you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Fail to pay subscription fees</li>
                <li>Misuse the Service or harm other users</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Upon termination, your right to use the Service will cease immediately. You may export your data before termination, and we will retain your data for 30 days after account closure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                12. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                13. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes via email or through the Platform. Your continued use of the Service after such changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                14. Contact Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-800 font-semibold mb-2">Okleevo Legal Team</p>
                <p className="text-gray-700">
                  Email:{" "}
                  <a href="mailto:legal@okleevo.com" className="text-blue-600 hover:underline">
                    legal@okleevo.com
                  </a>
                </p>
                <p className="text-gray-700 mt-2">
                  Support:{" "}
                  <a href="mailto:support@okleevo.com" className="text-blue-600 hover:underline">
                    support@okleevo.com
                  </a>
                </p>
                <p className="text-gray-700 mt-2">
                  Address: UK-based operations
                </p>
              </div>
            </section>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

