import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1C1E] font-sans p-8 md:p-16 max-w-4xl mx-auto">
      <Link href="/" className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1 mb-8">
        ← Back to Homepage
      </Link>
      <h1 className="text-3xl font-extrabold mb-6">Terms & Conditions</h1>
      <p className="text-sm text-gray-500 mb-4">Last Updated: July 11, 2026</p>
      
      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-900 mb-2">1. Agreement to Terms</h2>
          <p>By accessing or using our services at DentalFlow, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our platform.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">2. Services Offered</h2>
          <p>DentalFlow offers clinic appointment reminder utilities, patient communication tools, and data analytics dashboards. We charge fees for usage according to selected pricing plans (Starter, Growth, Pro).</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">3. User Accounts</h2>
          <p>To use our services, you must register for an account using Clerk credentials. You are responsible for safeguarding your login details and account activity.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">4. Payment Terms</h2>
          <p>All subscription plans are billed in US Dollars (USD). Payments are processed securely via our payment gateway integrations. You agree to pay the monthly/yearly fees associated with your selected subscription tier.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">5. Limitations of Liability</h2>
          <p>DentalFlow is provided "as is". We are not liable for any communication dropouts, SMS network errors, or appointment no-shows that occur while using our service.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">6. Governing Law</h2>
          <p>These terms shall be governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in India.</p>
        </section>
      </div>
    </div>
  );
}
