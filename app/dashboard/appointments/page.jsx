'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AppointmentModal from '@/components/AppointmentModal';
import RiskBadge from '@/components/RiskBadge';

const FILTERS = ['all', 'today', 'upcoming', 'past', 'scheduled', 'confirmed', 'no-show', 'completed'];

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  'no-show': 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-orange-100 text-orange-700',
};

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = [
  'bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400',
  'bg-purple-400', 'bg-orange-400', 'bg-teal-400', 'bg-red-400',
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function AppointmentsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [clinic, setClinic] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApt, setEditingApt] = useState(null);
  const [filter, setFilter] = useState('all');

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

      const { data: appts } = await supabase
        .from('appointments')
        .select(`id, datetime, status, no_show_risk, reminder_sent, patients:patient_id (id, name, phone, email)`)
        .eq('clinic_id', clinicData.id)
        .order('datetime', { ascending: false });
      setAppointments(appts || []);

      const { data: pts } = await supabase
        .from('patients').select('id, name, phone, email').eq('clinic_id', clinicData.id);
      setPatients(pts || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'today') return apt.datetime.split('T')[0] === new Date().toISOString().split('T')[0];
    if (filter === 'upcoming') return new Date(apt.datetime) > new Date();
    if (filter === 'past') return new Date(apt.datetime) < new Date();
    return apt.status === filter;
  });

  async function handleDelete(id) {
    if (!confirm('Delete this appointment?')) return;
    await supabase.from('appointments').delete().eq('id', id);
    setAppointments(appointments.filter(a => a.id !== id));
  }

  if (loading || !clinic) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C1C1E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#1C1C1E]">Appointments</h1>
          <p className="text-gray-500 mt-1 text-sm">{filteredAppointments.length} appointments</p>
        </div>
        <button
          onClick={() => { setEditingApt(null); setShowModal(true); }}
          className="bg-[#1C1C1E] hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
        >
          + New Appointment
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full font-medium transition capitalize text-sm ${
              filter === f
                ? 'bg-[#1C1C1E] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-500 font-medium">No appointments found</p>
            <button
              onClick={() => { setEditingApt(null); setShowModal(true); }}
              className="mt-3 text-[#1C1C1E] text-sm font-medium underline"
            >
              + Schedule one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reminder</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAppointments.map((apt) => {
                  const name = apt.patients?.name || 'Unknown';
                  const color = getAvatarColor(name);
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                            {getInitials(name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{name}</p>
                            <p className="text-xs text-gray-500">{apt.patients?.phone || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(apt.datetime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(apt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          statusColors[apt.status] || 'bg-gray-100 text-gray-700'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge risk={apt.no_show_risk} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${apt.reminder_sent ? 'text-green-600' : 'text-gray-400'}`}>
                          {apt.reminder_sent ? '✓ Sent' : '— Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditingApt(apt); setShowModal(true); }}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(apt.id)}
                            className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AppointmentModal
          clinic={clinic}
          patients={patients}
          appointment={editingApt}
          onClose={() => { setShowModal(false); setEditingApt(null); }}
          onSuccess={() => { setShowModal(false); setEditingApt(null); fetchData(); }}
        />
      )}
    </div>
  );
}
