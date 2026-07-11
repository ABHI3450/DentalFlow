'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-[#1C1C1E]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
          enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [clinicId, setClinicId] = useState(null);
  const [clinicName, setClinicName] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [reminderHours, setReminderHours] = useState(24);
  const [aiRiskScoring, setAiRiskScoring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch clinic & settings
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/signin'); return; }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      router.push('/onboarding');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        const { data: clinic, error: clinicError } = await supabase
          .from('clinics')
          .select('id, name')
          .eq('owner_email', email)
          .single();

        if (clinicError || !clinic) {
          router.push('/onboarding');
          return;
        }

        setClinicId(clinic.id);
        setClinicName(clinic.name || '');

        // Fetch settings (may not exist yet)
        const { data: settings } = await supabase
          .from('settings')
          .select('sms_enabled, email_enabled, reminder_hours_before')
          .eq('clinic_id', clinic.id)
          .single();

        if (settings) {
          setSmsEnabled(settings.sms_enabled ?? true);
          setEmailEnabled(settings.email_enabled ?? true);
          setReminderHours(settings.reminder_hours_before ?? 24);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoaded, user, router]);

  // Save handler
  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      // Update clinic name
      const { error: clinicError } = await supabase
        .from('clinics')
        .update({ name: clinicName, updated_at: new Date().toISOString() })
        .eq('id', clinicId);

      if (clinicError) throw clinicError;

      // Upsert settings
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({
          clinic_id: clinicId,
          sms_enabled: smsEnabled,
          email_enabled: emailEnabled,
          reminder_hours_before: reminderHours,
          updated_at: new Date().toISOString()
        }, { onConflict: 'clinic_id' });

      if (settingsError) throw settingsError;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Clinic Info */}
      <div className="border border-gray-200 rounded-2xl p-6 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Clinic Information</h2>
        <div>
          <label htmlFor="clinic-name" className="block text-sm font-medium text-gray-700 mb-1">
            Clinic Name
          </label>
          <input
            id="clinic-name"
            type="text"
            value={clinicName}
            onChange={e => setClinicName(e.target.value)}
            placeholder="Enter clinic name"
            className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Reminders */}
      <div className="border border-gray-200 rounded-2xl p-6 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Reminders</h2>

        <div className="space-y-5">
          {/* SMS Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">SMS Notifications</div>
              <div className="text-xs text-gray-500 mt-0.5">Send appointment reminders via SMS</div>
            </div>
            <Toggle enabled={smsEnabled} onChange={setSmsEnabled} />
          </div>

          {/* Email Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Email Notifications</div>
              <div className="text-xs text-gray-500 mt-0.5">Send appointment reminders via email</div>
            </div>
            <Toggle enabled={emailEnabled} onChange={setEmailEnabled} />
          </div>

          {/* AI Risk Scoring Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">
                AI Risk Scoring{' '}
                <span className="text-xs text-gray-400 font-normal">(cosmetic only)</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Use AI to predict no-show likelihood</div>
            </div>
            <Toggle enabled={aiRiskScoring} onChange={setAiRiskScoring} />
          </div>

          {/* Reminder Hours Dropdown */}
          <div>
            <label htmlFor="reminder-hours" className="block text-sm font-medium text-gray-700 mb-1">
              Remind patients before appointment
            </label>
            <select
              id="reminder-hours"
              value={reminderHours}
              onChange={e => setReminderHours(Number(e.target.value))}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={12}>12 hours before</option>
              <option value={24}>24 hours before</option>
              <option value={48}>48 hours before</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save button & feedback */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#1C1C1E] text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
        {error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>
    </div>
  );
}
