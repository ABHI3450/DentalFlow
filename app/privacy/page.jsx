import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1C1E] font-sans p-8 md:p-16 max-w-4xl mx-auto">
      <Link href="/" className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1 mb-8">
        ← Back to Homepage
      </Link>
      <h1 className="text-3xl font-extrabold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-4">Last Updated: July 11, 2026</p>
      
      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-900 mb-2">1. Information We Collect</h2>
          <p>We collect your clinic name, contact information (email), patient lists, appointments, and billing data in order to provide scheduling automation. Patient phones and emails are only processed for reminder distribution.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">2. How We Use Information</h2>
          <p>Your details are processed to manage clinic settings, deliver text/email notifications to patients, run no-show prediction algorithms, and verify subscription purchases.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">3. Data Sharing & Third-Parties</h2>
          <p>We share necessary delivery metrics with standard providers (e.g. Twilio for SMS dispatch, Resend for email, and Stripe/Razorpay for secure payment gateway processing). We never sell patient information to third-party advertisers.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">4. Data Security</h2>
          <p>We leverage Supabase and Clerk encryption protocols to secure all records, appointments, and credential profiles. However, no digital transmission can be guaranteed as 100% secure.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">5. Your Choices & Controls</h2>
          <p>You can edit or delete patient profiles and clinic settings directly within the app dashboard. If you wish to permanently delete your account, please submit a request via our Contact page.</p>
        </section>
      </div>
    </div>
  );
}
