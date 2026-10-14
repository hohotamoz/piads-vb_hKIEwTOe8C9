"use client"

import { AuthLayout } from "@/components/auth-layout"

export default function PrivacyPage() {
  return (
    <AuthLayout variant="dark">
      <div className="max-w-2xl mx-auto px-4 py-8 text-white">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="space-y-4 text-white/80">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Data We Collect</h2>
            <p>
              PiAds collects only the necessary data to provide our advertising services:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Pi Network username (for display purposes)</li>
              <li>Pi Network UID (for account identification)</li>
              <li>Ad content you choose to publish</li>
              <li>Payment transaction records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To display your ads to other users</li>
              <li>To process payments for featured ads and subscriptions</li>
              <li>To provide customer support</li>
              <li>To improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>All authentication is handled by Pi Network</li>
              <li>We never store your Pi wallet credentials</li>
              <li>All API communications use HTTPS</li>
              <li>Server API keys are never exposed to clients</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Third-Party Services</h2>
            <p>
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Pi Network Platform (authentication and payments)</li>
              <li>Supabase (optional, for ad storage)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Request deletion of your account data</li>
              <li>Request a copy of your data</li>
              <li>Opt out of non-essential data collection</li>
              <li>Close your account at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
            <p>
              For privacy-related inquiries, please contact us through our support channels.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Updates</h2>
            <p>
              This privacy policy may be updated from time to time. We will notify users of
              significant changes through the app.
            </p>
          </section>
        </div>
      </div>
    </AuthLayout>
  )
}
