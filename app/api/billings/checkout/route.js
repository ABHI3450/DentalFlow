import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { razorpay } from '@/lib/razorpay';

const PLANS = {
  growth: { amount: 99, currency: 'USD' },
  pro: { amount: 199, currency: 'USD' }
};

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const email = user.primaryEmailAddress?.emailAddress;
    
    // Fetch clinic to link the order
    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from('clinics')
      .select('id, name')
      .eq('owner_email', email)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clinic onboarding not complete' }, { status: 400 });
    }

    const planDetails = PLANS[plan];
    const amountInCents = planDetails.amount * 100; // Razorpay expects amount in smallest currency unit (cents/paise)

    // Create Razorpay Order
    const options = {
      amount: amountInCents,
      currency: planDetails.currency,
      receipt: `receipt_clinic_${clinic.id.slice(0, 8)}`,
      notes: {
        clinic_id: clinic.id,
        plan_selected: plan,
        owner_email: email
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      clinicName: clinic.name,
      ownerEmail: email
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json({ error: error.message || 'Error initiating payment' }, { status: 500 });
  }
}
