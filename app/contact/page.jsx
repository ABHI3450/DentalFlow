import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1C1E] font-sans p-8 md:p-16 max-w-2xl mx-auto">
      <Link href="/" className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1 mb-8">
        ← Back to Homepage
      </Link>
      <h1 className="text-3xl font-extrabold mb-4">Contact Us</h1>
      <p className="text-sm text-gray-500 mb-8">Got questions? We'd love to help you scale your dental practice.</p>
      
      <div className="space-y-6 text-sm text-gray-600 leading-relaxed mb-10">
        <div>
          <h2 className="font-bold text-gray-900 mb-1">📧 Email Support</h2>
          <p>support@dentalflow.com</p>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 mb-1">📍 Business Address</h2>
          <p>DentalFlow LLC, Section-J1, Sector 5, Kolkata, West Bengal, India</p>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 mb-1">📞 Phone Support</h2>
          <p>+91 98765 43210 (Mon - Fri, 9:00 AM - 6:00 PM IST)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-[#1C1C1E] mb-4">Send us a quick message</h2>
        <form className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Your Name</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="John Doe" required />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Clinic Email</label>
            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="doctor@clinic.com" required />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Message</label>
            <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm h-28" placeholder="How can we help you?" required></textarea>
          </div>
          <button type="submit" className="w-full bg-[#1C1C1E] hover:bg-gray-800 text-white text-xs font-semibold py-3 rounded-xl transition shadow-sm">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
