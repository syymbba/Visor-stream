import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

export interface TermsOfServicePageProps {
  /**
   * When provided, this page was reached from inside the authenticated app
   * (e.g. Settings > Support & Legal) rather than from the public landing
   * page. Shows a "Back to App" control that returns via client-side
   * navigation instead of a full page reload, so viewing the terms while
   * signed in doesn't feel like being kicked out of the platform.
   */
  onBackToApp?: () => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onBackToApp }) => (
  <main className="min-h-screen bg-[#0b0e14] text-slate-200 px-4 py-8 sm:px-6 lg:px-8">
    <article className="policy-page mx-auto max-w-4xl space-y-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-10">
      <header className="space-y-3 border-b border-slate-800 pb-6">
        <div className="flex items-center justify-between gap-3">
          {onBackToApp ? (
            <button
              onClick={onBackToApp}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-400 hover:text-sky-300"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to App
            </button>
          ) : (
            <a href="/" className="text-sm font-bold text-sky-400 hover:text-sky-300">Visor Stream</a>
          )}
        </div>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-sky-400" aria-hidden="true" />
          <h1 className="text-3xl font-black text-white sm:text-4xl">Terms of Service</h1>
        </div>
        <p className="text-sm text-slate-400">Effective date: August 29, 2026</p>
      </header>

      <p className="leading-7 text-slate-300">These Terms of Service ("Terms") govern your access to and use of Visor Stream ("Visor Stream", "we", "us", or "our"), a live streaming and gaming platform where creators broadcast gameplay, engage with fans, and monetize through subscriptions and tipping. By creating an account or otherwise using Visor Stream, you agree to these Terms. If you do not agree, do not use the Service.</p>

      <section className="space-y-3"><h2>1. Eligibility and Accounts</h2><p>You must be at least 13 years old to use Visor Stream. If you are under the age of majority where you live, you may use the Service only with appropriate parental or guardian consent. You are responsible for providing accurate account information, keeping your credentials secure, and all activity that occurs under your account. Creators who monetize content must be legally permitted to receive mobile money, card, or bank transfers in their jurisdiction.</p></section>
      <section className="space-y-3"><h2>2. Acceptable Use</h2><p>You may not use Visor Stream to violate any law or another person's rights; harass, threaten, exploit, or impersonate others; distribute malware, spam, or deceptive content; manipulate payments, tips, subscriptions, or engagement metrics; circumvent or exploit our security, rate limits, or two-factor authentication; access accounts or systems without authorization; or interfere with the operation of the platform.</p></section>
      <section className="space-y-3"><h2>3. User and Creator Content</h2><p>You retain ownership of content you submit. You grant Visor Stream a non-exclusive, worldwide, royalty-free, sublicensable license to host, reproduce, transmit, display, and technically adapt (e.g. transcode, thumbnail, clip) that content solely to operate, secure, and promote the Service. You represent that you own or otherwise have the rights needed to grant this license, and that your content does not infringe any third party's rights.</p><p>You are responsible for your content and must comply with copyright, privacy, advertising, and community-safety laws and our Community Guidelines. We may remove content, mute a stream, or restrict a feature that violates these Terms or creates legal or safety risk, with or without notice.</p></section>
      <section className="space-y-3"><h2>4. Copyright / DMCA Notice-and-Takedown</h2><p>We respect the intellectual property rights of others. If you believe content on Visor Stream infringes your copyright, send a notice to <a href="mailto:syymbba@gmail.com">syymbba@gmail.com</a> that includes: (a) identification of the copyrighted work claimed to be infringed; (b) identification and location (URL) of the allegedly infringing material; (c) your contact information; (d) a statement that you have a good-faith belief the use is not authorized; (e) a statement, under penalty of perjury, that the notice is accurate and you are authorized to act on behalf of the copyright owner; and (f) your physical or electronic signature. We may remove or disable access to material identified in a valid notice and will notify the affected user, who may submit a counter-notice as appropriate. Repeat infringers' accounts may be terminated.</p></section>
      <section className="space-y-3"><h2>5. Payments, Subscriptions, and Payouts</h2><p>Prices, currencies, renewal terms, and payment methods are shown at checkout. Payment processing is provided by third parties, primarily Pesapal, and is subject to their terms. A transaction is not complete until the payment provider confirms it.</p><p>Tips are generally passed through to the creator; subscriptions follow the revenue split disclosed in-app (currently 70% creator / 30% platform unless otherwise stated). Refunds, fees, eligibility requirements, and payout timing are governed by the applicable product or creator policy displayed by Visor Stream. Payout requests may remain pending while identity, balance, fraud, and payment checks are completed, and creators who enable two-factor authentication must provide a valid verification code to release a payout. Never rely on an on-screen estimate as proof of settlement.</p></section>
      <section className="space-y-3"><h2>6. Google and Third-Party Integrations</h2><p>Optional integrations, including Google OAuth sign-in and the Gmail feature, require your explicit authorization and are also governed by the relevant provider's terms. You can disconnect an integration at any time through Visor Stream Settings or your Google Account permissions.</p></section>
      <section className="space-y-3"><h2>7. Intellectual Property</h2><p>Visor Stream and its software, branding, design, and platform materials are owned by Visor Stream or its licensors. Except as expressly permitted, you may not copy, modify, sell, reverse engineer, scrape, or commercially exploit them.</p></section>
      <section className="space-y-3"><h2>8. Moderation and Termination</h2><p>We may investigate suspected violations, restrict features, suspend accounts, remove content, or terminate access, with or without notice, at our reasonable discretion. You may stop using the Service at any time. Provisions concerning content licenses, payments, disputes, limitations of liability, indemnification, and required records survive termination.</p></section>
      <section className="space-y-3"><h2>9. Disclaimers</h2><p>Visor Stream is provided on an "as available" and "as is" basis, without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee uninterrupted, error-free, secure, or lossless streaming, storage, payments, or third-party integrations. We are not responsible for third-party services, networks, devices, payment providers, or user-generated content.</p></section>
      <section className="space-y-3"><h2>10. Limitation of Liability</h2><p>To the maximum extent permitted by law, Visor Stream will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or loss of data, revenue, goodwill, or access arising from your use of the Service, even if advised of the possibility of such damages. Our aggregate liability for any claim arising from these Terms or the Service will not exceed the greater of (a) the amount you paid us in the 12 months preceding the claim, or (b) USD $50. Nothing in these Terms limits liability that cannot legally be limited, such as liability for fraud or gross negligence where applicable law prohibits such limitation.</p></section>
      <section className="space-y-3"><h2>11. Indemnification</h2><p>You agree to defend, indemnify, and hold harmless Visor Stream and its officers, employees, and agents from any claims, damages, liabilities, and expenses (including reasonable legal fees) arising from your content, your violation of these Terms, or your violation of any law or third-party right.</p></section>
      <section className="space-y-3"><h2>12. Governing Law and Dispute Resolution</h2><p>These Terms are governed by the laws of the Republic of Uganda, without regard to conflict-of-laws principles. Before initiating a formal claim, you agree to first contact us at <a href="mailto:syymbba@gmail.com">syymbba@gmail.com</a> so we can attempt to resolve the dispute informally. Any dispute that cannot be resolved informally will be subject to the exclusive jurisdiction of the competent courts of Uganda, except where mandatory local consumer-protection law requires otherwise.</p></section>
      <section className="space-y-3"><h2>13. Force Majeure</h2><p>We will not be liable for any failure or delay in performance resulting from causes beyond our reasonable control, including internet or power outages, acts of God, labor disputes, or actions of third-party providers (including payment or hosting providers).</p></section>
      <section className="space-y-3"><h2>14. General Provisions</h2><p>If any provision of these Terms is found unenforceable, the remaining provisions remain in full effect. These Terms, together with our Privacy Policy and any policies referenced in-app, constitute the entire agreement between you and Visor Stream regarding the Service. We may assign these Terms in connection with a merger, acquisition, or sale of assets; you may not assign your rights or obligations without our consent. You agree to comply with applicable export control and sanctions laws in your use of the Service.</p></section>
      <section className="space-y-3"><h2>15. Changes and Contact</h2><p>We may update these Terms as the Service changes. Continued use after an updated effective date means you accept the revised Terms. Questions, notices, and legal requests may be sent to <a href="mailto:syymbba@gmail.com">syymbba@gmail.com</a>.</p></section>

    </article>
  </main>
);
