-- ============================================
-- DentalRemind - Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. CLINICS
create table if not exists public.clinics (
  id            uuid primary key default gen_random_uuid(),
  owner_id      text not null,           -- Clerk userId
  name          text not null,
  phone         text,
  plan          text default 'starter',  -- starter | growth | pro
  reminder_hours int default 24,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. PATIENTS
create table if not exists public.patients (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid references public.clinics(id) on delete cascade,
  name          text not null,
  phone         text not null,
  email         text,
  past_no_shows int default 0,
  last_appointment_date timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 3. APPOINTMENTS
create table if not exists public.appointments (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid references public.clinics(id) on delete cascade,
  patient_id    uuid references public.patients(id) on delete cascade,
  datetime      timestamptz not null,
  status        text default 'scheduled', -- scheduled | confirmed | completed | no-show | cancelled
  no_show_risk  text default 'low',       -- low | medium | high
  notes         text,
  reminder_sent boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 4. STAFF
create table if not exists public.staff (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid references public.clinics(id) on delete cascade,
  user_id       text,                     -- Clerk userId (pending until they sign up)
  email         text not null,
  role          text default 'frontdesk', -- owner | frontdesk | admin
  created_at    timestamptz default now()
);

-- 5. SETTINGS
create table if not exists public.settings (
  id                   uuid primary key default gen_random_uuid(),
  clinic_id            uuid references public.clinics(id) on delete cascade unique,
  sms_enabled          boolean default true,
  email_enabled        boolean default true,
  reminder_hours_before int default 24,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- 6. REMINDER LOGS
create table if not exists public.reminder_logs (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid references public.appointments(id) on delete cascade,
  method          text not null,    -- sms | email
  delivered       boolean default false,
  error_message   text,
  created_at      timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table public.clinics      enable row level security;
alter table public.patients     enable row level security;
alter table public.appointments enable row level security;
alter table public.staff        enable row level security;
alter table public.settings     enable row level security;
alter table public.reminder_logs enable row level security;

-- Allow all operations for now (you can tighten later)
create policy "Allow all for clinics"       on public.clinics       for all using (true) with check (true);
create policy "Allow all for patients"      on public.patients      for all using (true) with check (true);
create policy "Allow all for appointments"  on public.appointments  for all using (true) with check (true);
create policy "Allow all for staff"         on public.staff         for all using (true) with check (true);
create policy "Allow all for settings"      on public.settings      for all using (true) with check (true);
create policy "Allow all for reminder_logs" on public.reminder_logs for all using (true) with check (true);
