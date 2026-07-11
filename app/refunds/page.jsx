import Link from 'next/link';

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1C1E] font-sans p-8 md:p-16 max-w-4xl mx-auto">
      <Link href="/" className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1 mb-8">
        ← Back to Homepage
      </Link>
      <h1 className="text-3xl font-extrabold mb-6">Refund & Cancellation Policy</h1>
      <p className="text-sm text-gray-500 mb-4">Last Updated: July 11, 2026</p>
      
      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-900 mb-2">1. Subscription Cancellations</h2>
          <p>You can cancel your subscription plan at any time directly through the Billing panel in your account dashboard. Upon cancellation, your access will continue until the end of your current active billing period, and you will not be billed further.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">2. Refunds Eligibility</h2>
          <p>Since our services offer a free Trial period under the Starter plan to evaluate the features before upgrading, all purchases are generally final. However, if you experience billing technical glitches, please contact us within **7 days** of the transaction for potential refunds.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">3. Refund Processing</h2>
          <p>Approved refunds are processed back to your original payment method (bank account or card) and will reflect within **5 to 7 business days**, in accordance with standard payment gateway refund timelines.</p>
        </section>
      </div>
    </div>
  );
}
