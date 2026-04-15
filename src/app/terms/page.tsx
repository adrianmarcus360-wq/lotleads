export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Terms of Service</h1>
      <div className="prose prose-gray">
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Service description</h2>
        <p className="text-gray-600 mb-4">We provide commercial property lead intelligence, including aerial imagery analysis and property contact data, to licensed contractors and service companies.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Acceptable use</h2>
        <p className="text-gray-600 mb-4">Lead data is licensed for one-time use per purchase. You may not resell, redistribute, or share lead data with third parties. Data is for legitimate business prospecting only.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Exclusivity</h2>
        <p className="text-gray-600 mb-4">Exclusive leads provide a 72-hour window during which no other buyer can purchase the same lead. After 72 hours, the lead may be sold to other buyers as a shared lead.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Refund policy</h2>
        <p className="text-gray-600 mb-4">If contact information is inaccurate or outdated, we will replace the lead within 24 hours of your report. No cash refunds after contact data has been delivered.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Compliance</h2>
        <p className="text-gray-600 mb-4">You agree to comply with all applicable laws, including CAN-SPAM, when contacting property managers using our data. You are responsible for your own outreach practices.</p>
      </div>
    </div>
  );
}
