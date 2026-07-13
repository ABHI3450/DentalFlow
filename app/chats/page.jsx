'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const avatarColors = [
  'bg-yellow-400','bg-pink-400','bg-blue-400','bg-green-400',
  'bg-purple-400','bg-orange-400','bg-teal-400','bg-red-400'
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ChatsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [clinicId, setClinicId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [activePatientId, setActivePatientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch clinic
  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchClinic() {
      try {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) { 
          router.push('/onboarding'); 
          setLoading(false);
          return; 
        }

        const { data, error } = await supabase
          .from('clinics')
          .select('id')
          .eq('owner_email', email)
          .single();

        if (error || !data) { 
          router.push('/onboarding'); 
          setLoading(false);
          return; 
        }
        setClinicId(data.id);
      } catch (err) {
        console.error('Error fetching clinic in chats:', err);
        setLoading(false);
      }
    }

    fetchClinic();
  }, [isLoaded, user, router]);

  // Fetch patients
  useEffect(() => {
    if (!clinicId) return;

    async function fetchPatients() {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, phone')
        .eq('clinic_id', clinicId)
        .order('name');

      if (!error && data) {
        setPatients(data);
        setFilteredPatients(data);
      }
      setLoading(false);
    }

    fetchPatients();
  }, [clinicId]);

  // Filter patients by search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredPatients(patients);
    } else {
      const q = search.toLowerCase();
      setFilteredPatients(patients.filter(p =>
        p.name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q))
      ));
    }
  }, [search, patients]);

  // Fetch messages when active patient changes
  useEffect(() => {
    if (!clinicId || !activePatientId) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender, text, created_at')
        .eq('clinic_id', clinicId)
        .eq('patient_id', activePatientId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    }

    fetchMessages();
  }, [clinicId, activePatientId]);

  // Send message
  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !activePatientId || sendingMessage) return;

    setSendingMessage(true);
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        clinic_id: clinicId,
        patient_id: activePatientId,
        sender: 'clinic',
        text: input
      }])
      .select();

    if (!error && data) {
      setMessages(prev => [...prev, data[0]]);
      setInput('');
    }
    setSendingMessage(false);
  }

  const activePatient = patients.find(p => p.id === activePatientId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chats</h1>

      <div className="border border-gray-200 rounded-2xl overflow-hidden" style={{ height: 480 }}>
        <div className="grid grid-cols-3 h-full">
          {/* Left pane — Patient list */}
          <div className="col-span-1 border-r border-gray-200 flex flex-col h-full">
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search patients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Patient list */}
            <div className="flex-1 overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm px-4 text-center">
                  <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  No patients found
                </div>
              ) : (
                filteredPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => { setActivePatientId(patient.id); setMessages([]); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      activePatientId === patient.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${getAvatarColor(patient.name)}`}>
                      {getInitials(patient.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{patient.name}</div>
                      {patient.phone && (
                        <div className="text-xs text-gray-400 truncate">{patient.phone}</div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right pane — Chat area */}
          <div className="col-span-2 flex flex-col h-full">
            {!activePatientId ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Select a patient to start chatting
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(activePatient?.name)}`}>
                    {getInitials(activePatient?.name)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{activePatient?.name}</div>
                    {activePatient?.phone && (
                      <div className="text-xs text-gray-400">{activePatient.phone}</div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                      No messages yet. Send a message to get started.
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'clinic' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                            msg.sender === 'clinic'
                              ? 'bg-[#1C1C1E] text-white ml-auto'
                              : 'bg-gray-100 text-gray-700 mr-auto'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sendingMessage}
                    className="px-4 py-2 bg-[#1C1C1E] text-white text-sm font-medium rounded-full hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
