import React from 'react';
import { Lock } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => (
  <main className="min-h-screen bg-[#0b0e14] text-slate-200 px-4 py-8 sm:px-6 lg:px-8">
    <article className="policy-page mx-auto max-w-4xl space-y-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-10">
      <header className="space-y-3 border-b border-slate-800 pb-6">
        <a href="/" className="text-sm font-bold text-sky-400 hover:text-sky-300">Visor Stream</a>
        <div className="flex items-center gap-3">
          <Lock className="h-6 w-6 text-sky-400" aria-hidden="true" />
          <h1 className="text-3xl font-black text-white sm:text-4xl">Privacy Policy</h1>
        </div>
        <p className="text-sm text-slate-400">Effective date: August 23, 2026</p>
      </header>

      <p className="leading-7 text-slate-300">
        This Privacy Policy explains how Visor Stream collects, uses, shares, and protects information when you use our live streaming and gaming platform. By using Visor Stream, you acknowledge this policy.
      </p>

      <section className="space-y-3">
        <h2>1. Information We Collect</h2>
        <p>We may collect information you provide, including your email address, display name, gamer tag, profile photo, account preferences, creator profile, messages, stream information, and support requests.</p>
        <p>When you use payments or monetization, we may process transaction references, payment status, currency, amount, mobile-money or payment-account details, and payout information. We do not store payment PINs or full card numbers.</p>
        <p>We also collect technical information such as IP address, device and browser information, diagnostic logs, approximate region, and activity needed to operate, secure, and improve the service.</p>
      </section>

      <section className="space-y-3">
        <h2>2. How We Use Information</h2>
        <ul>
          <li>Provide accounts, live streams, chat, creator tools, subscriptions, tips, and payouts.</li>
          <li>Authenticate users, prevent fraud and abuse, and protect platform security.</li>
          <li>Process payments, reconcile transactions, maintain records, and provide support.</li>
          <li>Communicate service updates, security notices, and responses to requests.</li>
          <li>Analyze reliability and improve features, performance, and accessibility.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>3. Google OAuth and Gmail</h2>
        <p>If you choose Google sign-in or Gmail features, we receive the Google account information and permissions you authorize. Gmail data is used only to provide the requested email features inside Visor Stream. We do not sell Google user data or use it for advertising.</p>
        <p>Our use and transfer of information received from Google APIs complies with the Google API Services User Data Policy, including its Limited Use requirements. You can revoke access from your Google Account security settings.</p>
      </section>

      <section className="space-y-3">
        <h2>4. Payment Providers and Other Services</h2>
        <p>Payments may be processed by Pesapal and other providers shown at checkout. These providers receive the information necessary to authorize and settle a transaction under their own privacy policies. Visor Stream receives payment status and transaction references, not payment PINs or full card credentials.</p>
        <p>We use Firebase for authentication and database services, Google APIs for optional integrations, and hosting, analytics, security, and infrastructure providers as needed to operate the platform.</p>
      </section>

      <section className="space-y-3">
        <h2>5. Sharing and Disclosure</h2>
        <p>We share information with service providers acting on our instructions, when required to complete a payment or payout, when necessary to protect users and the service, or when required by law. We do not sell personal information.</p>
      </section>

      <section className="space-y-3">
        <h2>6. Retention and Security</h2>
        <p>We retain information for as long as needed to provide the service, meet legal and financial obligations, resolve disputes, prevent abuse, and enforce agreements. We use access controls, authentication, encryption in transit, and security monitoring, but no online service can guarantee absolute security.</p>
      </section>

      <section className="space-y-3">
        <h2>7. Your Choices and Rights</h2>
        <p>You may review or update account information, disconnect Google integrations, and request access, correction, or deletion of personal information, subject to legal and transaction-record requirements. Contact us at <a href="mailto:syymbba@gmail.com">syymbba@gmail.com</a>.</p>
      </section>

      <section className="space-y-3">
        <h2>8. Children and International Users</h2>
        <p>Visor Stream is not intended for children under 13. If we learn that we collected information from a child under 13, we will take reasonable steps to delete it. Information may be processed in countries where our providers operate.</p>
      </section>

      <section className="space-y-3">
        <h2>9. Changes and Contact</h2>
        <p>We may update this policy when our services or legal obligations change. We will post the revised policy with a new effective date. Questions and privacy requests can be sent to <a href="mailto:syymbba@gmail.com">syymbba@gmail.com</a>.</p>
      </section>

      <footer className="border-t border-slate-800 pt-6 text-sm text-slate-400">
        <a href="/terms" className="text-sky-400 hover:text-sky-300">Terms of Service</a>
      </footer>
    </article>
  </main>
);
