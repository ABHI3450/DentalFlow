-- ============================================
-- DentalFlow - Additional Tables Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. RECORDS (Patient medical records)
create table if not exists public.records (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid references public.clinics(id) on delete cascade,
  patient_id  uuid references public.patients(id) on delete cascade,
  type        text not null default 'Notes',
  title       text not null,
  notes       text,
  created_at  timestamptz default now()
);

-- 2. DOCUMENTS (Clinic file metadata)
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid references public.clinics(id) on delete cascade,
  name        text not null,
  type        text default 'other',
  size_bytes  int,
  notes       text,
  created_at  timestamptz default now()
);

-- 3. MESSAGES (Patient chat messages)
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid references public.clinics(id) on delete cascade,
  patient_id  uuid references public.patients(id) on delete cascade,
  sender      text not null default 'clinic',
  text        text not null,
  created_at  timestamptz default now()
);

-- ============================================
-- Row Level Security
-- ============================================
alter table public.records   enable row level security;
alter table public.documents enable row level security;
alter table public.messages  enable row level security;

create policy "Allow all for records"   on public.records   for all using (true) with check (true);
create policy "Allow all for documents" on public.documents for all using (true) with check (true);
create policy "Allow all for messages"  on public.messages  for all using (true) with check (true);
