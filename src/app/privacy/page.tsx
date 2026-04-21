export default function PrivacyPage() {
  return (
    <div style={{ background: '#05050F', minHeight: '100vh', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Nav */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#0EA5E9', fontWeight: 700, textDecoration: 'none', fontSize: '18px', letterSpacing: '-0.01em' }}>LotLeads</a>
        <a href="/leads" style={{ color: '#94a3b8', fontSize: '14px', textDecoration: 'none' }}>Browse Leads →</a>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '48px' }}>Last updated: April 21, 2025</p>

        <Section title="1. Introduction">
          LotLeads (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the LotLeads platform at lotleads.app (the &ldquo;Service&rdquo;). This Privacy Policy describes how we collect, use, and protect information about you when you use our Service.
        </Section>

        <Section title="2. Information We Collect">
          <strong style={{ color: '#cbd5e1' }}>Account data:</strong> When you register, we collect your name, email address, company name, and password (hashed, never stored in plaintext).
          <br /><br />
          <strong style={{ color: '#cbd5e1' }}>Transaction data:</strong> When you purchase a lead, we record which lead was purchased, the purchase type (shared or exclusive), and the timestamp. Payment processing is handled entirely by Stripe — we do not store card numbers, CVV codes, or full billing addresses.
          <br /><br />
          <strong style={{ color: '#cbd5e1' }}>Usage data:</strong> We log pages visited, features used, and general interaction patterns to improve the Service. This data is tied to your account, not shared with third parties for advertising.
        </Section>

        <Section title="3. Lead Data Sources">
          The property information displayed in our leads is sourced from publicly available records including OpenStreetMap, county assessor databases, and commercial data providers such as Regrid. Property owner contact information is obtained from public business records. We do not collect private information from property owners without their consent — all data is sourced from publicly accessible registries.
        </Section>

        <Section title="4. How We Use Your Data">
          We use your information to:
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>Deliver purchased leads and manage your account</li>
            <li>Send transactional emails (purchase confirmations, account alerts)</li>
            <li>Prevent fraud and enforce our Terms of Service</li>
            <li>Improve platform features and lead scoring models</li>
            <li>Comply with legal obligations</li>
          </ul>
          <br />
          We do not sell your personal data to third parties. We do not use your data for behavioral advertising.
        </Section>

        <Section title="5. Payment Processing">
          All payments are processed by Stripe, Inc. When you enter payment details, that information goes directly to Stripe over an encrypted connection. LotLeads receives only a Stripe customer ID and payment confirmation. Stripe&apos;s privacy policy is available at stripe.com/privacy.
        </Section>

        <Section title="6. Data Retention">
          We retain your account data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where retention is required for legal, tax, or fraud-prevention purposes. Anonymized usage statistics may be retained indefinitely.
        </Section>

        <Section title="7. Your Rights">
          Depending on your jurisdiction, you may have the right to access, correct, or delete the personal data we hold about you. California residents have additional rights under CCPA, including the right to know what data is collected, the right to delete, and the right to opt out of data sale (we do not sell data). To exercise any of these rights, email us at support@lotleads.app.
        </Section>

        <Section title="8. Third-Party Services">
          Our Service integrates with the following third parties, each with their own privacy practices:
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li><strong style={{ color: '#cbd5e1' }}>Stripe</strong> — payment processing (stripe.com/privacy)</li>
            <li><strong style={{ color: '#cbd5e1' }}>Google Maps</strong> — aerial imagery (policies.google.com/privacy)</li>
            <li><strong style={{ color: '#cbd5e1' }}>Vercel</strong> — hosting and infrastructure (vercel.com/legal/privacy-policy)</li>
            <li><strong style={{ color: '#cbd5e1' }}>Neon</strong> — database (neon.tech/privacy)</li>
          </ul>
        </Section>

        <Section title="9. Security">
          We use HTTPS, hashed passwords, encrypted environment variables, and role-based access controls to protect your data. No internet transmission is 100% secure; use a strong, unique password for your account.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this Privacy Policy periodically. If we make material changes, we will notify registered users by email. Continued use of the Service after changes constitutes acceptance of the revised policy.
        </Section>

        <Section title="11. Contact">
          Questions? Email us at{' '}
          <a href="mailto:support@lotleads.app" style={{ color: '#0EA5E9', textDecoration: 'none' }}>support@lotleads.app</a>.
        </Section>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
        <a href="/" style={{ color: '#0EA5E9', textDecoration: 'none', marginRight: '16px' }}>LotLeads</a>
        <a href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', marginRight: '16px' }}>Privacy Policy</a>
        <a href="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px', letterSpacing: '-0.01em' }}>{title}</h2>
      <p style={{ fontSize: '15px', lineHeight: '1.75', color: '#94a3b8', margin: 0 }}>{children}</p>
    </div>
  );
}
