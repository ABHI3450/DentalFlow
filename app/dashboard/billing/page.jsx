'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Check, AlertCircle, Info, Landmark } from 'lucide-react';

const PLANS = {
  starter: { 
    name: 'Starter', 
    price: '$0', 
    inrPrice: '₹0',
    appointments: '100', 
    features: ['100 appointments/month', 'Basic email reminders', 'Email support'] 
  },
  growth: { 
    name: 'Growth', 
    price: '$99', 
    inrPrice: '₹8,266',
    appointments: '500', 
    features: ['500 appointments/month', 'Automated SMS & Email reminders', 'AI No-Show Risk scoring', 'Two-way patient chat thread', 'Priority support'] 
  },
  pro: { 
    name: 'Pro', 
    price: '$199', 
    inrPrice: '₹16,616',
    appointments: '2000', 
    features: ['2000 appointments/month', 'Full AI suite', 'Custom branding SMS', 'Dedicated account manager', 'API access'] 
  }
};

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [clinicId, setClinicId] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // 1. Inject Razorpay Script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchClinic = async () => {
      try {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;

        const { data, error: clinicError } = await supabase
          .from('clinics')
          .select('id, plan')
          .eq('owner_email', email)
          .single();

        if (clinicError) throw clinicError;
        if (!data) {
          router.push('/onboarding');
          return;
        }

        setClinicId(data.id);
        setCurrentPlan(data.plan || 'starter');
      } catch (error) {
        console.error('Error fetching clinic:', error);
        setError(error.message || 'Could not load billing information');
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [isLoaded, user, router]);

  // 2. Launch Razorpay Checkout Modal
  const handleUpgrade = async (planKey) => {
    if (planKey === currentPlan) {
      setNotice('You are already on this plan.');
      return;
    }

    if (planKey === 'starter') {
      // Downgrading to starter requires no checkout
      setUpgrading(true);
      setNotice('');
      setError('');
      try {
        const { error: updateError } = await supabase
          .from('clinics')
          .update({ plan: 'starter', updated_at: new Date().toISOString() })
          .eq('id', clinicId);

        if (updateError) throw updateError;
        setCurrentPlan('starter');
        setNotice('Plan switched back to Starter.');
      } catch (err) {
        setError(err.message || 'Error downgrading plan');
      } finally {
        setUpgrading(false);
      }
      return;
    }

    // Call checkout api to build Razorpay Order
    setUpgrading(true);
    setNotice('');
    setError('');

    try {
      const res = await fetch('/api/billings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to initiate checkout order');

      const { orderId, amount, currency, clinicName, ownerEmail } = data;

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId || keyId === 'rzp_test_YOUR_KEY_ID') {
        throw new Error('Razorpay public key not set in environment settings. Please verify configuration.');
      }

      // Configure checkout options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'DentalFlow Subscription',
        description: `${PLANS[planKey].name} Monthly Plan`,
        image: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
        order_id: orderId,
        handler: async function (response) {
          // Trigger signature verification on backend
          setUpgrading(true);
          try {
            const verifyRes = await fetch('/api/billings/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: planKey
              })
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) throw new Error(verifyData.error || 'Signature verification failed');

            setCurrentPlan(planKey);
            setNotice(`Payment verified! Subscribed to ${PLANS[planKey].name} successfully.`);
          } catch (verifyErr) {
            setError(verifyErr.message || 'Payment was captured but signature verification failed. Please contact support.');
          } finally {
            setUpgrading(false);
          }
        },
        prefill: {
          name: clinicName,
          email: ownerEmail
        },
        notes: {
          clinic_id: clinicId
        },
        theme: {
          color: '#1C1C1E'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(response.error.description || 'Payment transaction failed');
        setUpgrading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Checkout creation error:', err);
      setError(err.message || 'Unable to open checkout overlay');
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C1C1E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#1C1C1E] mb-2">Billing & Subscription</h1>
          <p className="text-gray-500 text-sm">
            Current subscription tier: <span className="font-semibold capitalize text-[#1C1C1E]">{currentPlan}</span>
          </p>
        </div>

        {notice && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm font-semibold text-green-700">
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700 flex items-start gap-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              {error.includes('public key') && (
                <p className="text-xs font-normal mt-1 text-red-600/80">
                  Please add your Razorpay Key ID (`NEXT_PUBLIC_RAZORPAY_KEY_ID`) in `.env.local` to process payments.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Currency Conversion Alert Banner */}
        <div className="mb-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 flex items-start gap-3">
          <Landmark className="text-indigo-600 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-bold text-indigo-900 mb-1">Dual-Currency & Automatic INR Settlement</h4>
            <p className="text-xs text-indigo-700 leading-relaxed max-w-4xl">
              To support your US-based clients, payments are processed and billed in **US Dollars (USD)**. Stripe/Razorpay will automatically convert incoming USD transactions into **Indian Rupees (INR)** and deposit the settled payouts directly to your Indian bank account based on live international settlement rates.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrentPlan = currentPlan === key;
            return (
              <div
                key={key}
                className={`rounded-2xl border overflow-hidden bg-white transition flex flex-col justify-between ${
                  isCurrentPlan
                    ? 'border-[#1C1C1E] shadow-md ring-1 ring-[#1C1C1E]'
                    : 'border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Header */}
                <div className={`p-6 border-b border-gray-100 ${isCurrentPlan ? 'bg-gray-50' : ''}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-xs text-gray-500 font-medium">/month</span>
                  </div>
                  {key !== 'starter' && (
                    <p className="text-[10px] text-gray-400 font-semibold bg-gray-100 inline-block px-2 py-0.5 rounded-md">
                      Approx. {plan.inrPrice} / month
                    </p>
                  )}
                  <p className="mt-3 text-xs text-gray-500">
                    Up to {plan.appointments} appointments/month
                  </p>
                </div>

                {/* Features & Action */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check size={16} className="text-[#1C1C1E] shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700 leading-normal">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed border border-gray-200"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(key)}
                      disabled={upgrading}
                      className="w-full py-3 bg-[#1C1C1E] hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      {upgrading ? 'Connecting...' : 'Upgrade Subscription'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Billing Info Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#1C1C1E] mb-4 flex items-center gap-2">
            <Info size={18} />
            Billing Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">BILLING EMAIL</p>
              <p className="text-sm font-semibold text-gray-900">{user?.primaryEmailAddress?.emailAddress || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">RENEWAL CYCLE</p>
              <p className="text-sm font-semibold text-gray-900">
                Monthly on the {new Date().getDate()}th
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
