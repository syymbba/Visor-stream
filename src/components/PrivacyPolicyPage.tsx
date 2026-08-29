import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';

export interface PrivacyPolicyPageProps {
  /**
   * When provided, this page was reached from inside the authenticated app
   * (e.g. Settings > Support & Legal) rather than from the public landing
   * page. Shows a "Back to App" control that returns via client-side
   * navigation instead of a full page reload, so viewing the policy while
   * signed in doesn't feel like being kicked out of the platform.
   */
  onBackToApp?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBackToApp }) => (
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
          <Lock className="h-6 w-6 text-sky-400" aria-hidden="true" />
          <h1 className="text-3xl font-black text-white sm:text-4xl">Privacy Policy</h1>
        </div>
        <p className="text-sm text-slate-400">Effective date: August 29, 2026</p>
      </header>

      <p className="leading-7 text-slate-300">
        This Privacy Policy explains how Visor Stream collects, uses, shares, and protects information when you use our live streaming and gaming platform, including our website and any related applications (collectively). By using Visor Stream, you acknowledge this policy. If you do not agree with this policy, please do not use the Service.
      </p>

      <section className="space-y-3">
        <h2>1. Information We Collect</h2>
        <p>We may collect information you provide directly, including your email address, display name, gamer tag, profile photo, account preferences, creator profile, chat messages, stream metadata, and support requests.</p>
        <p>When you use payments or monetization features, we may process transaction references, payment status, currency, amount, mobile-money or payment-account details, and payout information. We do not store payment PINs or full card numbers - those are handled directly by our payment processor.</p>
        <p>We also collect technical information such as IP address, device and browser information, diagnostic logs, approximate region (derived from IP address), and activity needed to operate, secure, and improve the Service.</p>
        <p>If you sign in with Google, we receive the basic profile information (name, email address, profile photo) associated with your Google account. If you separately connect Gmail features, see Section 3 below for what additional information that involves.</p>
      </section>

      <section className="space-y-3">
        <h2>2. Cookies and Similar Technologies</h2>
        <p>We use essential cookies and browser storage to keep you signed in and remember basic preferences (such as your selected currency or low-data mode). We do not use cookies for third-party advertising.</p>
        <p>We use privacy-conscious analytics and performance monitoring (Vercel Analytics and Vercel Speed Insights) to understand aggregate usage patterns and page performance. These tools are configured to avoid collecting personally identifying information such as full IP addresses, and we do not use them to build advertising profiles. You can control cookies through your browser settings, though disabling essential cookies may prevent you from staying signed in.</p>
      </section>

      <section className="space-y-3">
        <h2>3. How We Use Information</h2>
        <ul>
          <li>Provide accounts, live streams, chat, creator tools, subscriptions, tips, and payouts.</li>
          <li>Authenticate users, prevent fraud and abuse, and protect platform security (including two-factor authentication for creators who enable it).</li>
          <li>Process payments, reconcile transactions, maintain records, and provide support.</li>
          <li>Communicate service updates, security notices, and responses to requests.</li>
          <li>Analyze reliability and improve features, performance, and accessibility.</li>
          <li>Comply with legal obligations, including tax, anti-fraud, and financial recordkeeping requirements tied to payouts.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>4. Google OAuth and Gmail - Scopes and Limited Use</h2>
        <p>Visor Stream offers two distinct, separately-authorized ways to use your Google account:</p>
        <ul>
          <li><strong className="text-white">Basic sign-in ("Continue with Google").</strong> This only requests your basic Google profile and email address, used solely to create and authenticate your Visor Stream account. We do not request any other Google permissions for ordinary sign-in.</li>
          <li><strong className="text-white">Optional Gmail connection.</strong> If, and only if, you separately and explicitly choose to connect Gmail from within the Gmail feature, we request additional scopes (<code className="text-sky-300">gmail.readonly</code>, <code className="text-sky-300">gmail.modify</code>, <code className="text-sky-300">gmail.labels</code>, <code className="text-sky-300">gmail.send</code>) so that feature can display, organize, and send email on your behalf inside Visor Stream. This data is used only to power that in-app feature and is never used for advertising, and is never sold or shared with data brokers or used to train AI/ML models.</li>
        </ul>
        <p>Our use and transfer of information received from Google APIs complies with the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">Google API Services User Data Policy</a>, including its Limited Use requirements. You can review or revoke Visor Stream's access at any time from your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">Google Account security settings</a>, and you can disconnect the Gmail feature specifically from Visor Stream Settings.</p>
      </section>

      <section className="space-y-3">
        <h2>5. Payment Providers and Other Services</h2>
        <p>Payments and payouts are processed by Pesapal, which supports mobile money (M-Pesa, MTN MoMo, Airtel Money) and card payments. Pesapal receives the information necessary to authorize and settle a transaction under its own privacy policy. Visor Stream receives payment status and transaction references, not payment PINs or full card credentials.</p>
        <p>We use Firebase (Google) for authentication and database services, Postgres-compatible database hosting for financial records, Google APIs for optional integrations, and hosting, analytics, security, and infrastructure providers as needed to operate the platform.</p>
      </section>

      <section className="space-y-3">
        <h2>6. Sharing and Disclosure</h2>
        <p>We share information with service providers acting on our instructions (such as Pesapal, Firebase, and our hosting provider), when required to complete a payment or payout, when necessary to protect users and the Service, or when required by law or valid legal process. We do not sell personal information, and we do not share Google user data with third parties for advertising purposes.</p>
      </section>

      <section className="space-y-3">
        <h2>7. Retention and Security</h2>
        <p>We retain information for as long as needed to provide the Service, meet legal and financial obligations (including transaction and payout recordkeeping), resolve disputes, prevent abuse, and enforce agreements. When information is no longer needed for these purposes, we take reasonable steps to delete or anonymize it.</p>
        <p>We use access controls, authentication (including optional TOTP-based two-factor authentication for creators), encryption in transit, and security monitoring. No online service can guarantee absolute security. If we become aware of a security incident that affects your personal information, we will notify affected users and relevant authorities as required by applicable law.</p>
      </section>

      <section className="space-y-3">
        <h2>8. Your Choices and Rights</h2>
        <p>You may review or update account information, disconnect Google integrations, enable or disable two-factor authentication, and request access, correction, or deletion of personal information, subject to legal and transaction-record requirements. You can request deletion of your account and associated personal data by going to Settings, or by contacting us using the details in Section 11.</p>
        <p>Depending on where you live, you may have additional rights, including to:</p>
        <ul>
          <li>Access a copy of the personal information we hold about you, and receive it in a portable format.</li>
          <li>Correct inaccurate or incomplete personal information.</li>
          <li>Request erasure of your personal information, subject to legal retention requirements (e.g. completed transaction records).</li>
          <li>Object to or request restriction of certain processing.</li>
          <li>Withdraw consent where processing is based on consent (such as the optional Gmail connection).</li>
          <li>If you are a California resident, know what personal information is collected and request that it not be "sold" - we do not sell personal information, so there is nothing to opt out of in this regard.</li>
        </ul>
        <p>We will respond to verified requests within the timeframe required by applicable law.</p>
      </section>

      <section className="space-y-3">
        <h2>9. Children and International Users</h2>
        <p>Visor Stream is not intended for children under 13, and creators who monetize content must be old enough to lawfully receive payments in their jurisdiction. If we learn that we collected personal information from a child under 13 without appropriate consent, we will take reasonable steps to delete it.</p>
        <p>Visor Stream is operated from Uganda and may use service providers located in other countries. By using the Service, you understand that your information may be processed in countries other than your own, which may have different data protection laws than your home country. Where required, we rely on appropriate safeguards for such transfers.</p>
      </section>

      <section className="space-y-3">
        <h2>10. Changes to This Policy</h2>
        <p>We may update this policy when our services or legal obligations change. We will post the revised policy with a new effective date, and where changes are material, we will provide additional notice (such as an in-app or email notification).</p>
      </section>

      <section className="space-y-3">
        <h2>11. Contact Us</h2>
        <p>Questions, privacy requests, and data deletion requests can be sent to <a href="mailto:syymbba@gmail.com">syymbba@gmail.com</a>. We aim to respond to all legitimate requests within 30 days.</p>
      </section>

    </article>
  </main>
);
