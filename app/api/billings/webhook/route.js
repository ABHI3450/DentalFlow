import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or webhook secret configuration' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Handle payment capture
    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const order = event.payload.order?.entity || event.payload.payment?.entity;
      const notes = order?.notes || {};
      const clinicId = notes.clinic_id;
      const plan = notes.plan_selected;

      if (clinicId && plan) {
        const { error } = await supabaseAdmin
          .from('clinics')
          .update({ 
            plan: plan, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', clinicId);

        if (error) {
          console.error(`Failed to update clinic ${clinicId} via webhook:`, error);
          return NextResponse.json({ error: 'DB update error' }, { status: 500 });
        }
        console.log(`Successfully updated clinic ${clinicId} to plan ${plan} via webhook.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
