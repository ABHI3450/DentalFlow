import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to, subject, html, text) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      text
    });
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Resend error:', error);
    return { success: false, error: error.message };
  }
}

// Email template for appointment reminders
export function getReminderEmailTemplate(clinicName, patientName, appointmentTime) {
  const timeStr = new Date(appointmentTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Appointment Reminder</h2>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px; color: #333;">Hi <strong>${patientName}</strong>,</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          This is a friendly reminder that you have an appointment with <strong>${clinicName}</strong>.
        </p>
        <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; color: #667eea; font-weight: bold;">${timeStr}</p>
        </div>
        <p style="font-size: 15px; color: #555;">
          If you need to reschedule or cancel, please contact the clinic directly.
        </p>
        <p style="font-size: 13px; color: #999; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const text = `Hi ${patientName},\n\nThis is a reminder about your appointment with ${clinicName} on ${timeStr}.\n\nIf you need to reschedule, please contact the clinic directly.`;

  return { html, text };
}