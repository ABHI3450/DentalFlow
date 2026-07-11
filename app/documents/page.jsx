'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DOC_TYPES = ['consent', 'insurance', 'treatment', 'invoice', 'other'];

const typeIcons = {
  consent: '📋',
  insurance: '🏥',
  treatment: '📝',
  invoice: '💰',
  other: '📄',
};

const typeLabels = {
  consent: 'Consent Form',
  insurance: 'Insurance',
  treatment: 'Treatment',
  invoice: 'Invoice',
  other: 'Other',
};

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

export default function DocumentsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [clinic, setClinic] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'consent', size_kb: '', notes: '' });
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

      const { data: docs } = await supabase
        .from('documents')
        .select('id, name, type, size_bytes, notes, created_at')
        .eq('clinic_id', clinicData.id)
        .order('created_at', { ascending: false });
      setDocuments(docs || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDocs = documents.filter(d => {
    const q = search.toLowerCase();
    return !q || (d.name || '').toLowerCase().includes(q);
  });

  function openAdd() {
    setForm({ name: '', type: 'consent', size_kb: '', notes: '' });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const sizeBytes = form.size_kb ? Math.round(Number(form.size_kb) * 1024) : 0;
      await supabase.from('documents').insert({
        clinic_id: clinic.id,
        name: form.name,
        type: form.type,
        size_bytes: sizeBytes,
        notes: form.notes,
      });
      closeModal();
      await fetchData();
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    await supabase.from('documents').delete().eq('id', id);
    setDocuments(documents.filter(d => d.id !== id));
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
          <h1 className="text-4xl font-bold text-[#1C1C1E]">Documents</h1>
          <p className="text-gray-500 mt-1 text-sm">{filteredDocs.length} documents</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#1C1C1E] hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
        >
          + Add Document
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by document name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C1E]/20 bg-white"
        />
      </div>

      {/* Card Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-20 text-center">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-gray-500 font-medium">No documents found</p>
          <button
            onClick={openAdd}
            className="mt-3 text-[#1C1C1E] text-sm font-medium underline"
          >
            + Add a document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="card border border-gray-200 p-5 hover:shadow-md transition bg-white rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                  {typeIcons[doc.type] || '📄'}
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm font-semibold text-[#1C1C1E] truncate">{doc.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                  {typeLabels[doc.type] || doc.type}
                </span>
                <span className="text-xs text-gray-400">{formatSize(doc.size_bytes)}</span>
              </div>
              {doc.notes && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{doc.notes}</p>
              )}
              <p className="text-xs text-gray-400 mt-3">
                {new Date(doc.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-[#1C1C1E] mb-4">Add Document</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Consent Form - Smith"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C1E]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C1E]/20"
                >
                  {DOC_TYPES.map(t => (
                    <option key={t} value={t}>{typeLabels[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size (KB)</label>
                <input
                  type="number"
                  value={form.size_kb}
                  onChange={e => setForm({ ...form, size_kb: e.target.value })}
                  placeholder="e.g. 240"
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1C1E]/20"
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
                  {saving ? 'Saving...' : 'Save Document'}
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
