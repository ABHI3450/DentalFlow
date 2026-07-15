'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Calendar, ShieldCheck, MessageCircle, BarChart3, 
  ArrowRight, Sparkles, Clock, CheckCircle2, 
  Linkedin, Github, Users, Award, Zap, Globe, Cpu
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
              className="bg-[#1C1C1E] hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-xs text-indigo-700 font-semibold mb-6 animate-pulse">
          <Sparkles size={12} /> B2B Clinic Workflow Automation & AI Reminders
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight max-w-4xl mx-auto">
          Scale Your Dental Practice with <span className="underline decoration-indigo-500 decoration-wavy">DentalFlow</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          The ultimate intelligent dashboard for modern dental clinics. Reduce no-shows, automate patient reminders, and manage daily clinical operations with a single, beautiful hub.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto bg-[#1C1C1E] hover:bg-gray-800 text-white font-medium px-8 py-4 rounded-2xl transition shadow-md flex items-center justify-center gap-2 group"
          >
            Start Free Trial <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/signin" 
            className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-8 py-4 rounded-2xl transition flex items-center justify-center"
          >
            Book a Demo
          </Link>
        </div>
      </section>

      {/* Core Concept: What We Do */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-200/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">What We Do</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 mt-2 leading-tight">
              Optimizing Daily Dental Workflows With Modern Intelligence
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed text-sm md:text-base">
              DentalFlow is a B2B SaaS platform specifically crafted for dental clinics. We solve the administrative inefficiencies that slow down healthcare practices. By integrating electronic health records (EHR), file cabinets, automated messaging, and dynamic scheduling, we provide doctors with a unified workspace to focus on what matters most: patient care.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                <span className="text-xs md:text-sm text-gray-600 font-medium">Unified patient profile displaying past no-show statistics and records</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                <span className="text-xs md:text-sm text-gray-600 font-medium">Auto-pilot communications through SMS and Email gateways</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                <span className="text-xs md:text-sm text-gray-600 font-medium">Robust and secure multi-location clinical dashboard panels</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-md relative overflow-hidden group hover:shadow-lg transition">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl group-hover:bg-indigo-100/50 transition"></div>
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Zap size={18} className="text-indigo-600" /> Clinic Impact
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <span className="text-2xl font-black text-gray-900">85%</span>
                <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">Average No-Show Reduction</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <span className="text-2xl font-black text-gray-900">12+ Hours</span>
                <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">Weekly Staff Time Saved</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <span className="text-2xl font-black text-gray-900">₹1,40,000+</span>
                <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">Average Monthly Revenue Recovered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real World Impact */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-200/60">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Real World Value</span>
          <h2 className="text-3xl font-extrabold text-gray-950 mt-2">Solving True Clinical Bottlenecks</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Automated Outreach</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Manual calling is outdated. DentalFlow automatically dispatches text and email alerts before appointments, securing confirmations passively.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <Cpu size={24} />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">AI Chair Protection</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every empty dentist chair incurs cost. Our AI model evaluates user history and flags no-show hazards, giving your front desk time to reschedule.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
              <Globe size={24} />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Omnipresent Care</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Provide patients with seamless access to virtual assistants, secure documents folders, prescription histories, and instant chat channels.
            </p>
          </div>
        </div>
      </section>

      {/* B2B Capabilities */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-200/60 bg-white/40 rounded-3xl">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Business Level B2B Suite</span>
          <h2 className="text-3xl font-extrabold text-gray-950 mt-2">Why DentalFlow Wins at the B2B Level</h2>
          <p className="text-sm text-gray-500 mt-2">Built to scale from single chairs to multi-location healthcare franchises.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="flex gap-4 p-6 bg-white border border-gray-250/50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base">Robust Clinic CRM</h4>
              <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">Track comprehensive patient profiles, contact lists, prescription details, and visual lab reports dynamically linked across pages.</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-white border border-gray-250/50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <BarChart3 size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base">Real-time Stats Analytics</h4>
              <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">Deep metrics on practice confirmation rates, no-show trends, monthly growth, and patient retention analytics.</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-white border border-gray-250/50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <MessageCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base">Interconnected Chat Suite</h4>
              <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">Engage patients in real-time. Handshake communications allow front desks to resolve reschedules within seconds.</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-white border border-gray-250/50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base">Compliance & EHR Integration</h4>
              <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">Security at every step. Built to store digital consent forms, prescriptions, invoices, and diagnostic summaries safely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Developer Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-gray-200/60">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 border border-gray-250 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
          {/* Avatar Image */}
          <img 
            src="/abhishek.jpg" 
            alt="Abhishek Chandra SDE" 
            className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover shadow-md shrink-0 border border-gray-150"
          />
          <div className="flex-1 text-center md:text-left">
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Meet the Developer</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1">Abhishek Chandra</h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Software Development Engineer (SDE)</p>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed mt-3.5">
              Hi, I'm Abhishek, the architect behind DentalFlow. I design secure B2B software solutions that bridge the gap between complex database systems and beautiful user-friendly interfaces. Feel free to connect with me and explore my other projects!
            </p>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
              <a 
                href="https://www.linkedin.com/in/abhishekchandra-sde" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <Linkedin size={14} /> LinkedIn
              </a>
              <a 
                href="https://www.github.com/ABHI3450" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#1C1C1E] hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <Github size={14} /> GitHub
              </a>
            </div>
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