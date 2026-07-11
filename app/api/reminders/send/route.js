import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getUpcomingAppointments, markReminderSent, logReminder, getSettings } from '@/lib/supabase';
import { sendSMS, formatPhoneNumber } from '@/lib/twilio';
import { sendEmail, getReminderEmailTemplate } from '@/lib/resend';
import { generateReminderMessage } from '@/lib/gemini';

export async function POST(req) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const clinicsRes = await supabaseAdmin.from('clinics').select('id, name');
    if (!clinicsRes.data || clinicsRes.data.length === 0) {
      return new Response(JSON.stringify({ message: 'No clinics found' }), { status: 200 });
    }

    let totalSent = 0;
    let totalErrors = 0;

    for (const clinic of clinicsRes.data) {
      const settings = await getSettings(clinic.id);
      const hoursBeforeReminder = settings?.data?.reminder_hours_before || 24;

      const appointmentsRes = await getUpcomingAppointments(clinic.id, hoursBeforeReminder);
      if (!appointmentsRes.data) continue;

      for (const apt of appointmentsRes.data) {
        if (!apt.patients) continue;
        const patient = apt.patients;
        const clinicName = apt.clinics?.name || clinic.name;

        try {
          const reminderMessage = await generateReminderMessage(clinicName, patient.name, apt.datetime);

          if (settings?.data?.sms_enabled && patient.phone) {
            const formattedPhone = formatPhoneNumber(patient.phone);
            const smsResult = await sendSMS(formattedPhone, reminderMessage);
            await logReminder(apt.id, 'sms', smsResult.success, smsResult.error || null);
            if (smsResult.success) totalSent++;
            else totalErrors++;
          }

          if (settings?.data?.email_enabled && patient.email) {
            const { html, text } = getReminderEmailTemplate(clinicName, patient.name, apt.datetime);
            const emailResult = await sendEmail(patient.email, 'Appointment Reminder', html, text);
            await logReminder(apt.id, 'email', emailResult.success, emailResult.error || null);
            if (emailResult.success) totalSent++;
            else totalErrors++;
          }

          await markReminderSent(apt.id);
        } catch (error) {
          console.error(`Error sending reminder for appointment ${apt.id}:`, error);
          totalErrors++;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, totalSent, totalErrors }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Reminder job error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
