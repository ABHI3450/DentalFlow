-- Run this in Supabase SQL Editor to add the doctor_name column to the clinics table:
alter table public.clinics add column if not exists doctor_name text default 'Smith';
