'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TopBar from '@/components/TopBar';
import VirtualDentistWidget from '@/components/VirtualDentistWidget';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [clinic, setClinic] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [confirmRate, setConfirmRate] = useState(0);
  const [highRiskToday, setHighRiskToday] = useState(0);
  const [activePatients, setActivePatients] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/signin');
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        // 1. Get clinic for this owner
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .select('*')
          .eq('owner_email', email)
          .single();

        if (clinicError || !clinicData) {
          router.push('/onboarding');
          return;
        }

        setClinic(clinicData);

        // 2. Today's date range
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

        // 3. Today's appointments
        const { data: todayAppts } = await supabase
          .from('appointments')
          .select('id, datetime, status, no_show_risk, reminder_sent, patients:patient_id (id, name, phone)')
          .eq('clinic_id', clinicData.id)
          .gte('datetime', todayStart)
          .lte('datetime', todayEnd)
          .order('datetime');

        const appts = todayAppts || [];
        setTodayAppointments(appts);
        setTodayCount(appts.length);
        setHighRiskToday(appts.filter((a) => a.no_show_risk === 'high').length);

        // 4. Total patients count
        const { count: patientCount } = await supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('clinic_id', clinicData.id);

        setActivePatients(patientCount || 0);

        // 5. All appointments for confirmation rate
        const { data: allAppts } = await supabase
          .from('appointments')
          .select('id, status')
          .eq('clinic_id', clinicData.id);

        const all = allAppts || [];
        if (all.length > 0) {
          const confirmed = all.filter((a) => a.status === 'confirmed' || a.status === 'completed').length;
          setConfirmRate(Math.round((confirmed / all.length) * 100));
        } else {
          setConfirmRate(0);
        }
      } catch (error) {
        console.error('Error in dashboard loading:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoaded, user, router]);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    'no-show': 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-orange-100 text-orange-700',
  };

  const riskColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <TopBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F46E5]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <TopBar />
      <main className="max-w-7xl mx-auto p-8 text-[#1C1C1E]">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1C1C1E]">
            {clinic?.name || 'DentalFlow Clinic'} 🦷
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            {getGreeting()}, Dr. {user?.lastName || user?.firstName || ''} · You have <span className="font-semibold text-[#1C1C1E]">{todayCount}</span> appointment{todayCount !== 1 ? 's' : ''} scheduled today.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl p-6 bg-[#f4d35e] shadow-sm">
            <p className="text-sm font-medium opacity-80">Today&apos;s Appointments</p>
            <p className="text-3xl font-bold mt-2">{todayCount}</p>
          </div>
          <div className="rounded-2xl p-6 bg-[#c3d9a0] shadow-sm">
            <p className="text-sm font-medium opacity-80">Confirmation Rate</p>
            <p className="text-3xl font-bold mt-2">{confirmRate}%</p>
          </div>
          <div className="rounded-2xl p-6 bg-[#f9a8c9] shadow-sm">
            <p className="text-sm font-medium opacity-80">High Risk Today</p>
            <p className="text-3xl font-bold mt-2">{highRiskToday}</p>
          </div>
          <div className="rounded-2xl p-6 bg-[#a9c1e8] shadow-sm">
            <p className="text-sm font-medium opacity-80">Active Patients</p>
            <p className="text-3xl font-bold mt-2">{activePatients}</p>
          </div>
        </div>

        {/* Main content: Appointments + Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Today&apos;s Appointments</h2>
            {todayAppointments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No appointments scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-semibold text-sm">
                        {appt.patients?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{appt.patients?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{appt.patients?.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[appt.status] || 'bg-gray-100 text-gray-600'}`}>
                        {appt.status}
                      </span>
                      {appt.no_show_risk && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${riskColors[appt.no_show_risk] || ''}`}>
                          {appt.no_show_risk} risk
                        </span>
                      )}
                      {appt.reminder_sent && (
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                          Reminded
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Virtual Dentist Widget */}
          <div className="lg:col-span-1">
            <VirtualDentistWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
