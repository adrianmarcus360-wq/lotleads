export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <div className="prose prose-gray">
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">What we collect</h2>
        <p className="text-gray-600 mb-4">We collect your name, email, company name, and payment information when you create an account or purchase a lead. We do not sell your personal data.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Lead data</h2>
        <p className="text-gray-600 mb-4">Property data is sourced from public county assessor records, OpenStreetMap, and other publicly available sources. Contact information is sourced from public business records.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Payments</h2>
        <p className="text-gray-600 mb-4">Payments are processed by Stripe. We do not store credit card numbers.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Contact</h2>
        <p className="text-gray-600">Questions? Email us at support@{process.env.NEXT_PUBLIC_APP_NAME?.toLowerCase() ?? 'lotleads'}.io</p>
      </div>
    </div>
  );
}
