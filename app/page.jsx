'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Calendar, ShieldCheck, MessageCircle, BarChart3, 
  ArrowRight, Sparkles, Clock, CheckCircle2 
} from 'lucide-react';

export default function LandingPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect signed-in users straight to the dashboard
  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/dashboard');
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1C1E] font-sans selection:bg-[#1C1C1E] selection:text-white">
      {/* Navbar */}
      <header className="border-b border-gray-200/60 backdrop-blur-md sticky top-0 bg-[#FAF9F6]/80 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1C1C1E]"></span>
            <span className="text-[#1C1C1E] font-bold text-xl italic tracking-tight">DentalFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/signin" 
              className="text-sm font-semibold hover:text-gray-600 transition"
            >
              Sign in
            </Link>
            <Link 
              href="/signup" 
              className="bg-[#1C1C1E] hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-xs text-indigo-700 font-semibold mb-6 animate-fade-in">
          <Sparkles size={12} /> Smart Appointment Reminder & AI Prediction
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight max-w-4xl mx-auto">
          Reduce Dental Clinic <span className="underline decoration-indigo-500 decoration-wavy">No-Shows</span> by 85%
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Smart automated SMS & email reminders, live patient chats, AI-powered no-show risk scoring, and a virtual dental assistant to keep your clinic filled and efficient.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto bg-[#1C1C1E] hover:bg-gray-800 text-white font-medium px-8 py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 group"
          >
            Start Free Trial <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/signin" 
            className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-8 py-3.5 rounded-xl transition flex items-center justify-center"
          >
            Schedule a Demo
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-200/60">
        <h2 className="text-center text-sm font-bold tracking-wider text-gray-400 uppercase mb-12">
          Designed specifically for dental practices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-[#1C1C1E] mb-2">Automated Reminders</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Send SMS and email confirmations 12, 24, or 48 hours before appointments. Zero manual effort required.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-[#1C1C1E] mb-2">AI Risk Prediction</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Flag appointments at high risk of no-show before they happen based on patient history and scheduling habits.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle size={20} />
            </div>
            <h3 className="font-bold text-[#1C1C1E] mb-2">Instant Patient Chat</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Direct two-way SMS communication thread right inside the dashboard to handle quick reschedules.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-[#1C1C1E] mb-2">Practice Reports</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Get real-time insights on your appointment confirmation rates, total no-shows, and revenue statistics.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section (Mandatory for Payment Gateways) */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-200/60">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 mt-2 text-sm">Choose the plan that fits your clinic size. No hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Starter</h3>
              <p className="text-xs text-gray-400 mt-1">For single practitioner clinics</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-sm text-gray-500"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex items-center gap-2">✓ 100 appointments/month</li>
                <li className="flex items-center gap-2">✓ Basic email reminders</li>
                <li className="flex items-center gap-2">✓ Patient list manager</li>
              </ul>
            </div>
            <Link 
              href="/signup" 
              className="mt-8 block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-3 rounded-xl transition"
            >
              Get Started
            </Link>
          </div>

          {/* Growth */}
          <div className="bg-white rounded-2xl border-2 border-indigo-600 p-8 shadow-md relative flex flex-col justify-between">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
              Popular
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Growth</h3>
              <p className="text-xs text-gray-400 mt-1">Perfect for growing practices</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-gray-900">$99</span>
                <span className="text-sm text-gray-500"> / month</span>
                <p className="text-[10px] text-indigo-600 font-semibold mt-1">Approx. ₹8,266 / month</p>
              </div>
              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex items-center gap-2">✓ 500 appointments/month</li>
                <li className="flex items-center gap-2">✓ Automated SMS & Email reminders</li>
                <li className="flex items-center gap-2">✓ AI No-Show Risk scoring</li>
                <li className="flex items-center gap-2">✓ Two-way patient chat thread</li>
              </ul>
            </div>
            <Link 
              href="/signup" 
              className="mt-8 block text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-3 rounded-xl transition shadow-sm"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pro</h3>
              <p className="text-xs text-gray-400 mt-1">For multi-location clinic networks</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-gray-900">$199</span>
                <span className="text-sm text-gray-500"> / month</span>
                <p className="text-[10px] text-gray-400 mt-1">Approx. ₹16,616 / month</p>
              </div>
              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex items-center gap-2">✓ 2,000 appointments/month</li>
                <li className="flex items-center gap-2">✓ Advanced analytics dashboard</li>
                <li className="flex items-center gap-2">✓ Custom brand text messages</li>
                <li className="flex items-center gap-2">✓ Dedicated account manager</li>
              </ul>
            </div>
            <Link 
              href="/signup" 
              className="mt-8 block text-center bg-[#1C1C1E] hover:bg-gray-800 text-white text-xs font-semibold py-3 rounded-xl transition"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer / Legal Compliance Section (Critical for Razorpay review) */}
      <footer className="border-t border-gray-200 bg-white py-12 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-gray-700">DentalFlow LLC</p>
            <p className="mt-1">Providing smart workflow automation for modern clinics.</p>
            <p className="mt-2 text-[10px]">Merchant Country: India</p>
          </div>
          <div className="flex gap-6 flex-wrap">
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/refunds" className="hover:underline">Refund & Cancellation Policy</Link>
            <Link href="/contact" className="hover:underline">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}