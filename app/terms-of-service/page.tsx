"use client"

import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <article className="mx-auto max-w-3xl space-y-6">
        <Link href="/" className="text-sm text-primary underline">← Back to PiAds</Link>
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">PiAds</p>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: October 15, 2026</p>
        </header>
        <p>These Terms of Service apply to your use of PiAds, a platform for browsing and publishing advertisements and classified listings. By using PiAds, you agree to these terms. If you do not agree, do not use the service.</p>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Using PiAds</h2>
          <p>You must use PiAds lawfully and provide information that is accurate to the best of your knowledge. You are responsible for your account activity and for keeping any sign-in credentials or access methods secure.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. Listings and user content</h2>
          <p>You are responsible for the listings, images, messages, reviews, and other content you submit. Content must be truthful, lawful, and must not infringe another person’s rights. Do not post fraudulent, misleading, abusive, discriminatory, illegal, or otherwise harmful content.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. Prohibited activity</h2>
          <p>You may not use PiAds to scam users, impersonate another person, distribute malware, interfere with the service, harvest other users’ information without permission, or advertise goods or services that are illegal or prohibited by applicable law.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Transactions between users</h2>
          <p>Unless a feature explicitly states otherwise, PiAds provides a place to discover and communicate about listings; it is not a party to agreements between buyers and sellers. Users should independently verify listings, sellers, item condition, prices, and payment arrangements. Exercise caution and never share passwords, private keys, or wallet recovery phrases.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. Moderation and availability</h2>
          <p>PiAds may investigate reports and restrict, remove, or disable content or access where reasonably necessary to protect users, maintain the service, or comply with law. We do not guarantee uninterrupted availability, that every listing is accurate, or that a transaction will be completed successfully.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">6. Intellectual property</h2>
          <p>The PiAds name, design, and service materials may be protected by applicable intellectual-property laws. You retain rights to content you own, and you grant the permissions needed to display that content within the service when you submit it. Do not upload content you lack the right to use.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">7. Disclaimers and liability</h2>
          <p>To the extent permitted by applicable law, PiAds is provided on an “as available” basis without guarantees that the service will be error-free or that user content is reliable. Nothing in these terms excludes liability or consumer rights that cannot lawfully be excluded.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">8. Changes or termination</h2>
          <p>We may update these terms as the service evolves. The revised terms will be posted on this page with an updated date. Access may be restricted where these terms are violated or where necessary to protect the service or its users.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">9. Contact</h2>
          <p>For questions about these terms, contact the PiAds operator through the official support channel provided with the app. Before launch, the operator should add a monitored contact email or other reliable contact method here.</p>
        </section>
        <p className="border-t pt-5 text-sm text-muted-foreground">This page is a general terms template, not legal advice. The operator should review it for the app’s actual features and applicable law before launch.</p>
      </article>
    </main>
  )
}
