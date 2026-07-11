import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── APPOINTMENTS ────────────────────────────────────────────────────────────
// Schema: id, clinic_id, patient_id, datetime, status, no_show_risk,
//         reminder_sent, created_at, updated_at

export async function getAppointments(clinicId, filters = {}) {
  let query = supabase
    .from('appointments')
    .select(`id, datetime, status, no_show_risk, reminder_sent, created_at,
             patients:patient_id (id, name, phone, email)`)
    .eq('clinic_id', clinicId);

  if (filters.status)   query = query.eq('status', filters.status);
  if (filters.fromDate) query = query.gte('datetime', filters.fromDate);
  if (filters.toDate)   query = query.lte('datetime', filters.toDate);

  return query.order('datetime', { ascending: false });
}

export async function createAppointment(clinicId, patientId, datetime, status = 'scheduled') {
  return supabase
    .from('appointments')
    .insert([{ clinic_id: clinicId, patient_id: patientId, datetime, status, no_show_risk: 'low', reminder_sent: false }])
    .select();
}

export async function updateAppointment(id, updates) {
  return supabase
    .from('appointments')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', id)
    .select();
}

export async function deleteAppointment(id) {
  return supabase.from('appointments').delete().eq('id', id);
}

export async function markReminderSent(appointmentId) {
  return supabase
    .from('appointments')
    .update({ reminder_sent: true, updated_at: new Date() })
    .eq('id', appointmentId);
}

// ─── PATIENTS ────────────────────────────────────────────────────────────────
// Schema: id, clinic_id, name, phone, email, past_no_shows,
//         last_appointment_date, created_at, updated_at

export async function getPatients(clinicId) {
  return supabase
    .from('patients')
    .select('id, name, phone, email, past_no_shows, created_at')
    .eq('clinic_id', clinicId)
    .order('name');
}

export async function createPatient(clinicId, name, phone, email) {
  return supabase
    .from('patients')
    .insert([{ clinic_id: clinicId, name, phone, email }])
    .select();
}

export async function updatePatient(id, updates) {
  return supabase
    .from('patients')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', id)
    .select();
}

// ─── CLINICS ─────────────────────────────────────────────────────────────────
// Schema: id, name, owner_email, owner_id, stripe_customer_id,
//         plan, max_appointments, created_at, updated_at

export async function getClinic(clinicId) {
  return supabase.from('clinics').select('*').eq('id', clinicId).single();
}

export async function getClinicByOwnerEmail(email) {
  return supabase.from('clinics').select('*').eq('owner_email', email).single();
}

export async function getClinicByEmail(email) {
  return getClinicByOwnerEmail(email);
}

export async function updateClinic(id, updates) {
  return supabase.from('clinics').update({ ...updates, updated_at: new Date() }).eq('id', id).select();
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
// Schema: id, clinic_id, reminder_hours_before,
//         sms_enabled, email_enabled, created_at, updated_at

export async function getSettings(clinicId) {
  return supabase.from('settings').select('*').eq('clinic_id', clinicId).single();
}

export async function updateSettings(clinicId, updates) {
  return supabase
    .from('settings')
    .update({ ...updates, updated_at: new Date() })
    .eq('clinic_id', clinicId)
    .select()
    .single();
}

export async function upsertSettings(clinicId, settings) {
  return supabase
    .from('settings')
    .upsert(
      { clinic_id: clinicId, ...settings, updated_at: new Date() },
      { onConflict: 'clinic_id' }
    )
    .select()
    .single();
}

// ─── REMINDER LOGS ───────────────────────────────────────────────────────────
// Schema: id, appointment_id, sent_at, method, delivered, error_message

export async function logReminder(appointmentId, method, delivered, errorMessage = null) {
  return supabase
    .from('reminder_logs')
    .insert([{ appointment_id: appointmentId, method, delivered, error_message: errorMessage, sent_at: new Date() }]);
}

// ─── UPCOMING APPOINTMENTS FOR REMINDERS ────────────────────────────────────

export async function getUpcomingAppointments(clinicId, hoursFromNow = 24) {
  const now = new Date();
  const future = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);

  return supabase
    .from('appointments')
    .select(`id, datetime, reminder_sent,
             patients:patient_id (id, name, phone, email),
             clinics:clinic_id (name)`)
    .eq('clinic_id', clinicId)
    .eq('status', 'scheduled')
    .gte('datetime', now.toISOString())
    .lte('datetime', future.toISOString())
    .eq('reminder_sent', false);
}

// ─── RECORDS ─────────────────────────────────────────────────────────────────
// Schema: id, clinic_id, patient_id, type, title, notes, created_at

export async function getRecords(clinicId) {
  return supabase
    .from('records')
    .select('id, type, title, notes, created_at, patients:patient_id (id, name)')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });
}

export async function createRecord(clinicId, patientId, type, title, notes) {
  return supabase
    .from('records')
    .insert([{ clinic_id: clinicId, patient_id: patientId, type, title, notes }])
    .select();
}

export async function updateRecord(id, updates) {
  return supabase
    .from('records')
    .update(updates)
    .eq('id', id)
    .select();
}

export async function deleteRecord(id) {
  return supabase.from('records').delete().eq('id', id);
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────
// Schema: id, clinic_id, name, type, size_bytes, notes, created_at

export async function getDocuments(clinicId) {
  return supabase
    .from('documents')
    .select('id, name, type, size_bytes, notes, created_at')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });
}

export async function createDocument(clinicId, name, type, sizeBytes, notes) {
  return supabase
    .from('documents')
    .insert([{ clinic_id: clinicId, name, type, size_bytes: sizeBytes, notes }])
    .select();
}

export async function deleteDocument(id) {
  return supabase.from('documents').delete().eq('id', id);
}

// ─── MESSAGES ────────────────────────────────────────────────────────────────
// Schema: id, clinic_id, patient_id, sender, text, created_at

export async function getMessages(clinicId, patientId) {
  return supabase
    .from('messages')
    .select('id, sender, text, created_at')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });
}

export async function sendMessage(clinicId, patientId, text, sender = 'clinic') {
  return supabase
    .from('messages')
    .insert([{ clinic_id: clinicId, patient_id: patientId, sender, text }])
    .select();
}
