import { auth } from '@clerk/nextjs/server';
import { sendSMS, formatPhoneNumber } from '@/lib/twilio';
import { sendEmail, getReminderEmailTemplate } from '@/lib/resend';
import { generateReminderMessage } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const body = await req.json();
    const { appointmentId, patientName, patientPhone, patientEmail, clinicName, datetime } = body;
    const { userId } = await auth();

    if (!userId) {
      // Allow sending reminders only for the public demo clinic
      const { data: apt } = await supabase
        .from('appointments')
        .select('clinic_id')
        .eq('id', appointmentId)
        .single();

      if (!apt || apt.clinic_id !== 'd3b07384-d113-43a0-b5a0-53bc47285641') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Generate AI reminder message
    const message = await generateReminderMessage(clinicName, patientName, datetime);

    let smsSent = false;
    let emailSent = false;

    // Send SMS
    if (patientPhone) {
      const formatted = formatPhoneNumber(patientPhone);
      const result = await sendSMS(formatted, message);
      smsSent = result.success;
    }

    // Send Email
    if (patientEmail) {
      const { html, text } = getReminderEmailTemplate(clinicName, patientName, datetime);
      const result = await sendEmail(patientEmail, `Appointment Reminder — ${clinicName}`, html, text);
      emailSent = result.success;
    }

    // Mark reminder as sent
    if (appointmentId && (smsSent || emailSent)) {
      await supabase
        .from('appointments')
        .update({ reminder_sent: true })
        .eq('id', appointmentId);
    }

    return Response.json({ success: smsSent || emailSent, smsSent, emailSent, message });
  } catch (error) {
    console.error('Send reminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
