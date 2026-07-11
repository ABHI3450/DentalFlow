'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const RECORD_TYPES = ['All', 'X-Ray', 'Treatment Plan', 'Prescription', 'Lab Report', 'Notes'];

export default function RecordsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [clinic, setClinic] = useState(null);
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({ patient_id: '', type: 'X-Ray', title: '', notes: '' });
  const [saving, setSaving] = useState(false);

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

      const { data: recs } = await supabase
        .from('records')
        .select('id, type, title, notes, created_at, patients:patient_id (id, name)')
        .eq('clinic_id', clinicData.id)
        .order('created_at', { ascending: false });
      setRecords(recs || []);

      const { data: pts } = await supabase
        .from('patients').select('id, name').eq('clinic_id', clinicData.id);
      setPatients(pts || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = records.filter(r => {
    const matchesType = filter === 'All' || r.type === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (r.patients?.name || '').toLowerCase().includes(q) ||
      (r.title || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  function openAdd() {
    setEditingRecord(null);
    setForm({ patient_id: patients[0]?.id || '', type: 'X-Ray', title: '', notes: '' });
    setShowModal(true);
  }

  function openEdit(record) {
    setEditingRecord(record);
    setForm({
      patient_id: record.patients?.id || '',
      type: record.type || 'X-Ray',
      title: record.title || '',
      notes: record.notes || '',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingRecord(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.patient_id || !form.title) return;
    setSaving(true);
    try {
      if (editingRecord) {
        await supabase.from('records').update({
          patient_id: form.patient_id,
          type: form.type,
          title: form.title,
          notes: form.notes,
        }).eq('id', editingRecord.id);
      } else {
        await supabase.from('records').insert({
          clinic_id: clinic.id,
          patient_id: form.patient_id,
          type: form.type,
          title: form.title,
          notes: form.notes,
        });
      }
      closeModal();
      await fetchData();
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    await supabase.from('records').delete().eq('id', id);
    setRecords(records.filter(r => r.id !== id));
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
          <h1 className="text-4xl font-bold text-[#1C1C1E]">Records</h1>
          <p className="text-gray-500 mt-1 text-sm">{filteredRecords.length} records</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#1C1C1E] hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
        >
          + Add Record
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by patient name or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C1E]/20 bg-white"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {RECORD_TYPES.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full font-medium transition text-sm ${
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
        {filteredRecords.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">🗂️</p>
            <p className="text-gray-500 font-medium">No records found</p>
            <button
              onClick={openAdd}
              className="mt-3 text-[#1C1C1E] text-sm font-medium underline"
            >
              + Add a record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{rec.patients?.name || 'Unknown'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {rec.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{rec.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">
                        {new Date(rec.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(rec)}
                          className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-[#1C1C1E] mb-4">
              {editingRecord ? 'Edit Record' : 'Add Record'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  value={form.patient_id}
                  onChange={e => setForm({ ...form, patient_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C1E]/20"
                  required
                >
                  <option value="">Select patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C1E]/20"
                >
                  {RECORD_TYPES.filter(t => t !== 'All').map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Full mouth X-Ray"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C1E]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C1E]/20 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#1C1C1E] hover:bg-gray-800 text-white py-2.5 rounded-xl font-medium transition text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Record'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
