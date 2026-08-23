import React from 'react';
import { FileText } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => (
  <main className="min-h-screen bg-[#0b0e14] text-slate-200 px-4 py-8 sm:px-6 lg:px-8">
    <article className="policy-page mx-auto max-w-4xl space-y-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-10">
      <header className="space-y-3 border-b border-slate-800 pb-6">
        <a href="/" className="text-sm font-bold text-sky-400 hover:text-sky-300">Visor Stream</a>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-sky-400" aria-hidden="true" />
          <h1 className="text-3xl font-black text-white sm:text-4xl">Terms of Service</h1>
        </div>
        <p className="text-sm text-slate-400">Effective date: August 23, 2026</p>
      </header>

      <p className="leading-7 text-slate-300">These Terms of Service govern your access to Visor Stream, a live streaming and gaming platform where creators broadcast gameplay, engage with fans, and monetize through subscriptions and tipping. By using Visor Stream, you agree to these terms.</p>

      <section className="space-y-3"><h2>1. Eligibility and Accounts</h2><p>You must be at least 13 years old to use Visor Stream. If you are under the age of majority where you live, you may use the service only with appropriate consent. You are responsible for accurate account information, keeping credentials secure, and activity under your account.</p></section>
      <section className="space-y-3"><h2>2. Acceptable Use</h2><p>You may not use Visor Stream to violate law or another person’s rights; harass, threaten, exploit, or impersonate others; distribute malware, spam, or deceptive content; manipulate payments or engagement; access accounts or systems without authorization; or interfere with platform operations.</p></section>
      <section className="space-y-3"><h2>3. User and Creator Content</h2><p>You retain ownership of content you submit. You grant Visor Stream a non-exclusive, worldwide, royalty-free license to host, reproduce, transmit, display, and technically adapt that content to operate and promote the service. You represent that you have the rights needed to grant this license.</p><p>You are responsible for your content and must comply with copyright, privacy, advertising, and community-safety laws. We may remove content that violates these terms or creates risk.</p></section>
      <section className="space-y-3"><h2>4. Payments, Subscriptions, and Payouts</h2><p>Prices, currencies, renewal terms, and payment methods are shown at checkout. Payment processing is provided by third parties such as Pesapal and is subject to their terms. A transaction is not complete until the provider confirms it.</p><p>Tips, subscriptions, refunds, fees, revenue shares, eligibility requirements, and payout timing are governed by the applicable product or creator policy displayed by Visor Stream. Payout requests may remain pending while identity, balance, fraud, and payment checks are completed. Never rely on an on-screen estimate as proof of settlement.</p></section>
      <section className="space-y-3"><h2>5. Google and Third-Party Integrations</h2><p>Optional integrations, including Google OAuth and Gmail features, require your authorization and are also governed by the relevant provider terms. You can disconnect an integration at any time through the provider account settings.</p></section>
      <section className="space-y-3"><h2>6. Intellectual Property</h2><p>Visor Stream and its software, branding, design, and platform materials are owned by Visor Stream or its licensors. Except as expressly permitted, you may not copy, modify, sell, reverse engineer, or commercially exploit them.</p></section>
      <section className="space-y-3"><h2>7. Moderation and Termination</h2><p>We may investigate suspected violations, restrict features, suspend accounts, remove content, or terminate access. You may stop using the service at any time. Provisions concerning content licenses, payments, disputes, limitations, and required records survive termination.</p></section>
      <section className="space-y-3"><h2>8. Disclaimers</h2><p>Visor Stream is provided on an “as available” basis. We do not guarantee uninterrupted, error-free, secure, or lossless streaming, storage, payments, or third-party integrations. We are not responsible for third-party services, networks, devices, or user-generated content.</p></section>
      <section className="space-y-3"><h2>9. Limitation of Liability</h2><p>To the maximum extent permitted by law, Visor Stream will not be liable for indirect, incidental, special, consequential, or punitive damages, or loss of data, revenue, goodwill, or access arising from use of the service. Nothing in these terms limits liability that cannot legally be limited.</p></section>
      <section className="space-y-3"><h2>10. Changes and Contact</h2><p>We may update these terms as the service changes. Continued use after an updated effective date means you accept the revised terms. Questions, notices, and legal requests may be sent to <a href="mailto:syymbba@gmail.com">syymbba@gmail.com</a>.</p></section>

      <footer className="border-t border-slate-800 pt-6 text-sm text-slate-400"><a href="/privacy" className="text-sky-400 hover:text-sky-300">Privacy Policy</a></footer>
    </article>
  </main>
);
