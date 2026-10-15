"use client"

import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <article className="mx-auto max-w-3xl space-y-6">
        <Link href="/" className="text-sm text-primary underline">← Back to PiAds</Link>
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">PiAds</p>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: October 15, 2026</p>
        </header>
        <p>This Privacy Policy explains how PiAds may handle information when you use our advertising and classifieds platform. Please read it before using the service.</p>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Information you provide</h2>
          <p>Depending on the features you use, you may provide account details, listing titles and descriptions, prices, categories, region or location details, listing images, messages, reviews, and other information you choose to submit. Do not publish sensitive personal information in public listings or messages.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. Information stored on your device</h2>
          <p>PiAds may store certain preferences and activity locally on your device, such as recent searches and viewed or liked listing information, to support app features. You can clear this information by clearing the app or browser storage, although this may remove saved preferences.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. How information is used</h2>
          <p>Information may be used to display and manage listings, support search and discovery, enable messaging and account features, maintain security, troubleshoot errors, and improve the service.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Service providers and sharing</h2>
          <p>PiAds may rely on hosting, database, authentication, or other technical providers to operate features you use. Information may be processed by those providers as needed to deliver the service. Public listing information may be visible to other users. We do not promise that information submitted to the service is confidential when you choose to publish it.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. Retention and security</h2>
          <p>Information may be retained for as long as needed to provide the service, meet legitimate operational needs, resolve disputes, or comply with applicable law. We use reasonable measures to protect information, but no online service can guarantee absolute security.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">6. Children</h2>
          <p>PiAds is not intended for children who are not permitted to use online services under the laws applicable to them. If you believe a child has provided personal information inappropriately, contact the service operator through the support channel made available with the app.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">7. Your choices</h2>
          <p>You should only submit information you are comfortable sharing. You may stop using the service and clear locally stored browser data at any time. Requests to access, correct, or delete account information should be made through the support channel provided by the app operator, where available.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">8. Changes to this policy</h2>
          <p>This policy may be updated as PiAds changes. Updates will be published on this page with a revised date. Continued use after an update means you acknowledge the updated policy, to the extent permitted by law.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">9. Contact</h2>
          <p>For privacy questions, contact the PiAds operator through the official support channel provided with the app. Before launch, the operator should add a monitored contact email or other reliable contact method here.</p>
        </section>
        <p className="border-t pt-5 text-sm text-muted-foreground">This page is a general privacy notice, not legal advice. The operator should review it to ensure it accurately reflects the app’s actual data practices and applicable law.</p>
      </article>
    </main>
  )
}
