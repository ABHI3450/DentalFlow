-- Run this in your Supabase SQL Editor to insert realistic dummy data for the demo account:

-- 1. Insert the Demo Clinic (Smile Dental Clinic)
insert into public.clinics (id, name, owner_email, doctor_name, plan)
values (
  'd3b07384-d113-43a0-b5a0-53bc47285641',
  'Smile Dental Clinic',
  'demo@dentalflow.com',
  'Chandra',
  'pro'
)
on conflict (id) do update set
  name = excluded.name,
  owner_email = excluded.owner_email,
  doctor_name = excluded.doctor_name,
  plan = excluded.plan;

-- 2. Insert Demo Settings
insert into public.settings (clinic_id, sms_enabled, email_enabled, reminder_hours_before)
values (
  'd3b07384-d113-43a0-b5a0-53bc47285641',
  true,
  true,
  24
)
on conflict (clinic_id) do update set
  sms_enabled = excluded.sms_enabled,
  email_enabled = excluded.email_enabled,
  reminder_hours_before = excluded.reminder_hours_before;

-- 3. Insert Demo Patients
insert into public.patients (id, clinic_id, name, phone, email, past_no_shows)
values 
  ('p001-doe', 'd3b07384-d113-43a0-b5a0-53bc47285641', 'John Doe', '+1 (555) 123-4567', 'john.doe@email.com', 0),
  ('p002-connor', 'd3b07384-d113-43a0-b5a0-53bc47285641', 'Sarah Connor', '+1 (555) 987-6543', 'sarah.connor@email.com', 1),
  ('p003-vance', 'd3b07384-d113-43a0-b5a0-53bc47285641', 'Robert Vance', '+1 (555) 444-2222', 'robert.vance@email.com', 4)
on conflict (id) do nothing;

-- 4. Insert Demo Appointments (Adjust dates to today and tomorrow)
insert into public.appointments (id, clinic_id, patient_id, datetime, status, no_show_risk, reminder_sent)
values
  (
    'apt-001',
    'd3b07384-d113-43a0-b5a0-53bc47285641',
    'p001-doe',
    (current_date + interval '14 hours')::timestamp,
    'scheduled',
    'low',
    false
  ),
  (
    'apt-002',
    'd3b07384-d113-43a0-b5a0-53bc47285641',
    'p002-connor',
    (current_date + interval '1 day 10 hours')::timestamp,
    'confirmed',
    'low',
    true
  ),
  (
    'apt-003',
    'd3b07384-d113-43a0-b5a0-53bc47285641',
    'p003-vance',
    (current_date + interval '16 hours 30 minutes')::timestamp,
    'scheduled',
    'high',
    false
  )
on conflict (id) do nothing;

-- 5. Insert a few Demo Records
insert into public.records (id, clinic_id, patient_id, type, title, notes, created_at)
values
  (
    'rec-001',
    'd3b07384-d113-43a0-b5a0-53bc47285641',
    'p001-doe',
    'Prescription',
    'Painkiller & Antibiotic Protocol',
    'Amoxicillin 500mg - 3x daily for 7 days. Ibuprofen 600mg as needed for postoperative pain.',
    now()
  ),
  (
    'rec-002',
    'd3b07384-d113-43a0-b5a0-53bc47285641',
    'p002-connor',
    'X-Ray',
    'Panoramic Dental X-Ray Log',
    'Extensive molar wear on lower left quad. Wisdom tooth extraction recommended for quad 3.',
    now() - interval '2 days'
  )
on conflict (id) do nothing;
