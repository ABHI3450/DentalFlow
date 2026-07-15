'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import PatientModal from '@/components/PatientModal';

const avatarColors = [
  'bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400',
  'bg-purple-400', 'bg-orange-400', 'bg-teal-400', 'bg-red-400',
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function PatientsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [clinic, setClinic] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    fetchData();
  }, [isLoaded, user]);

  async function fetchData() {
    try {
      const email = user?.primaryEmailAddress?.emailAddress || 'demo@dentalflow.com';
      const { data: clinicData } = await supabase
        .from('clinics').select('*').eq('owner_email', email).single();

      if (!clinicData) { router.push('/onboarding'); return; }
      setClinic(clinicData);

      const { data: pts } = await supabase
        .from('patients')
        .select('id, name, phone, email, past_no_shows, created_at')
        .eq('clinic_id', clinicData.id)
        .order('name');
      setPatients(pts || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm)) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  async function handleDelete(id) {
    if (!confirm('Delete this patient?')) return;
    await supabase.from('patients').delete().eq('id', id);
    setPatients(patients.filter(p => p.id !== id));
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
          <h1 className="text-4xl font-bold text-[#1C1C1E]">Patients</h1>
          <p className="text-gray-500 mt-1 text-sm">{filteredPatients.length} patients</p>
        </div>
        <button
          onClick={() => { setEditingPatient(null); setShowModal(true); }}
          className="bg-[#1C1C1E] hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
        >
          + Add Patient
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
        />
      </div>

      {/* Patient cards grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-20 text-center">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-gray-500 font-medium">No patients found</p>
          <button
            onClick={() => { setEditingPatient(null); setShowModal(true); }}
            className="mt-3 text-[#1C1C1E] text-sm font-medium underline"
          >
            + Add a patient
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const color = getAvatarColor(patient.name);
            const noShows = patient.past_no_shows || 0;

            return (
              <div key={patient.id} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition group">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {getInitials(patient.name)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-gray-900 truncate">{patient.name}</p>
                      {noShows > 0 && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          noShows >= 3 ? 'bg-red-100 text-red-700' :
                          noShows >= 1 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {noShows} no-show{noShows !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{patient.phone || '—'}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{patient.email || '—'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => { setEditingPatient(patient); setShowModal(true); }}
                    className="flex-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(patient.id)}
                    className="flex-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <PatientModal
          clinic={clinic}
          patient={editingPatient}
          onClose={() => { setShowModal(false); setEditingPatient(null); }}
          onSuccess={() => { setShowModal(false); setEditingPatient(null); fetchData(); }}
        />
      )}
    </div>
  );
}
