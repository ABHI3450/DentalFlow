import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !plan) {
      return NextResponse.json({ error: 'Missing payment signature verification details' }, { status: 400 });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Razorpay secret key not configured' }, { status: 500 });
    }

    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature. Verification failed.' }, { status: 400 });
    }

    // Payment is valid! Update clinic's subscription plan in Supabase.
    const email = user.primaryEmailAddress?.emailAddress;
    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from('clinics')
      .update({ 
        plan: plan, 
        updated_at: new Date().toISOString() 
      })
      .eq('owner_email', email)
      .select('id, name, plan')
      .single();

    if (clinicError || !clinic) {
      console.error('Error updating clinic plan after payment:', clinicError);
      return NextResponse.json({ error: 'Payment verified, but failed to update clinic plan in database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to ${plan} plan.`,
      clinic
    });
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    return NextResponse.json({ error: error.message || 'Verification system error' }, { status: 500 });
  }
}
