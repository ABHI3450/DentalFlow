'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [clinic, setClinic] = useState(null);
  const [settings, setSettings] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [reminderHours, setReminderHours] = useState(24);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchData();
  }, [isLoaded, user]);

  async function fetchData() {
    try {
      const email = user.primaryEmailAddress?.emailAddress;
      const { data: clinicData } = await supabase
        .from('clinics').select('*').eq('owner_email', email).single();
      if (!clinicData) { router.push('/onboarding'); return; }

      setClinic(clinicData);
      setClinicName(clinicData.name || '');

      // Load settings
      const { data: settingsData } = await supabase
        .from('settings').select('*').eq('clinic_id', clinicData.id).single();
      if (settingsData) {
        setSettings(settingsData);
        setReminderHours(settingsData.reminder_hours_before || 24);
        setSmsEnabled(settingsData.sms_enabled ?? true);
        setEmailEnabled(settingsData.email_enabled ?? true);
      }

      // Load staff
      const { data: staffData } = await supabase
        .from('staff').select('id, email, role, name').eq('clinic_id', clinicData.id);
      setStaff(staffData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Update clinic name
      await supabase.from('clinics').update({ name: clinicName }).eq('id', clinic.id);

      // Upsert settings
      if (settings) {
        await supabase.from('settings').update({
          reminder_hours_before: reminderHours,
          sms_enabled: smsEnabled,
          email_enabled: emailEnabled,
        }).eq('clinic_id', clinic.id);
      } else {
        await supabase.from('settings').insert({
          clinic_id: clinic.id,
          reminder_hours_before: reminderHours,
          sms_enabled: smsEnabled,
          email_enabled: emailEnabled,
        });
      }
      alert('Settings saved!');
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddStaff() {
    if (!newStaffEmail.trim()) return;
    try {
      await supabase.from('staff').insert({
        clinic_id: clinic.id,
        email: newStaffEmail,
        name: newStaffName || newStaffEmail,
        role: 'frontdesk',
      });
      setNewStaffEmail('');
      setNewStaffName('');
      fetchData();
    } catch (error) {
      alert('Error adding staff: ' + error.message);
    }
  }

  async function handleDeleteStaff(id) {
    if (!confirm('Remove this staff member?')) return;
    await supabase.from('staff').delete().eq('id', id);
    fetchData();
  }

  if (loading || !clinic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clinic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Clinic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
              <input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
              <input type="text" value={clinic.owner_email || ''} disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <input type="text" value={clinic.plan || 'starter'} disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 capitalize" />
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Reminder Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Send reminders how many hours before?</label>
              <select value={reminderHours} onChange={(e) => setReminderHours(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value={12}>12 hours before</option>
                <option value={24}>24 hours before</option>
                <option value={48}>48 hours before</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">📱 SMS Reminders (Twilio)</span>
              <button onClick={() => setSmsEnabled(!smsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${smsEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${smsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">✉️ Email Reminders (Resend)</span>
              <button onClick={() => setEmailEnabled(!emailEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${emailEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${emailEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={handleSave} disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-8 py-2.5 rounded-lg font-medium transition">
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Staff Management */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Staff Management</h2>
        <div className="flex gap-2 mb-6">
          <input type="text" placeholder="Name" value={newStaffName}
            onChange={(e) => setNewStaffName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input type="email" placeholder="Email" value={newStaffEmail}
            onChange={(e) => setNewStaffEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <button onClick={handleAddStaff}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            Add
          </button>
        </div>
        <div className="space-y-2">
          {staff.length > 0 ? staff.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 text-sm">{s.name || s.email}</p>
                <p className="text-xs text-gray-500">{s.email} · <span className="capitalize">{s.role}</span></p>
              </div>
              <button onClick={() => handleDeleteStaff(s.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium">Remove</button>
            </div>
          )) : (
            <p className="text-gray-500 text-sm">No staff members yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
