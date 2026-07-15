'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TopBar from '@/components/TopBar';

export default function StatisticsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [confirmRate, setConfirmRate] = useState(0);
  const [noShowCount, setNoShowCount] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);

  // Breakdowns
  const [statusCounts, setStatusCounts] = useState({});
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [topNoShowPatients, setTopNoShowPatients] = useState([]);

  useEffect(() => {
    if (!isLoaded) return;

    const email = user?.primaryEmailAddress?.emailAddress || 'demo@dentalflow.com';

    async function fetchData() {
      try {
        setLoading(true);

        // 1. Get clinic
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

      // 2. All appointments
      const { data: allAppts } = await supabase
        .from('appointments')
        .select('id, status, datetime')
        .eq('clinic_id', clinicData.id);

      const appts = allAppts || [];
      setTotalAppointments(appts.length);

      // Confirmation rate
      const confirmed = appts.filter((a) => a.status === 'confirmed' || a.status === 'completed').length;
      setConfirmRate(appts.length > 0 ? Math.round((confirmed / appts.length) * 100) : 0);

      // No-show count
      const noShows = appts.filter((a) => a.status === 'no-show').length;
      setNoShowCount(noShows);

      // Status counts
      const counts = {};
      appts.forEach((a) => {
        counts[a.status] = (counts[a.status] || 0) + 1;
      });
      setStatusCounts(counts);

      // Monthly trend (last 6 months)
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        const count = appts.filter((a) => {
          const dt = new Date(a.datetime);
          return dt >= monthStart && dt <= monthEnd;
        }).length;
        months.push({ label, count });
      }
      setMonthlyTrend(months);

      // 3. All patients
      const { count: patientCount } = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicData.id);

      setTotalPatients(patientCount || 0);

      // 4. Top no-show patients
      const { data: patients } = await supabase
        .from('patients')
        .select('id, name, past_no_shows')
        .eq('clinic_id', clinicData.id)
        .order('past_no_shows', { ascending: false })
        .limit(5);

      setTopNoShowPatients((patients || []).filter((p) => p.past_no_shows > 0));
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoaded, user, router]);

  const statusConfig = {
    scheduled: { color: 'bg-blue-500', label: 'Scheduled' },
    confirmed: { color: 'bg-green-500', label: 'Confirmed' },
    completed: { color: 'bg-gray-400', label: 'Completed' },
    'no-show': { color: 'bg-red-500', label: 'No-Show' },
    cancelled: { color: 'bg-orange-400', label: 'Cancelled' },
  };

  const noShowBadgeColor = (count) => {
    if (count >= 5) return 'bg-red-100 text-red-700';
    if (count >= 3) return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  // Max values for bar scaling
  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);
  const maxMonthlyCount = Math.max(...monthlyTrend.map((m) => m.count), 1);

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
        <h1 className="text-3xl font-bold mb-8">Statistics</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500">Total Appointments</p>
            <p className="text-3xl font-bold mt-2">{totalAppointments}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500">Confirmation Rate</p>
            <p className="text-3xl font-bold mt-2">{confirmRate}%</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500">No-Show Count</p>
            <p className="text-3xl font-bold mt-2">{noShowCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500">Total Patients</p>
            <p className="text-3xl font-bold mt-2">{totalPatients}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Appointments by Status */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Appointments by Status</h2>
            <div className="space-y-4">
              {Object.entries(statusConfig).map(([key, cfg]) => {
                const count = statusCounts[key] || 0;
                const width = maxStatusCount > 0 ? (count / maxStatusCount) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">{cfg.label}</span>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`${cfg.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Monthly Trend</h2>
            <div className="space-y-4">
              {monthlyTrend.map((month) => {
                const width = maxMonthlyCount > 0 ? (month.count / maxMonthlyCount) * 100 : 0;
                return (
                  <div key={month.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">{month.label}</span>
                      <span className="text-sm font-semibold">{month.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-[#4F46E5] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top No-Show Patients */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Top No-Show Patients</h2>
          {topNoShowPatients.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No patients with no-show records.</p>
          ) : (
            <div className="space-y-3">
              {topNoShowPatients.map((patient, idx) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#FAF9F6] border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {patient.past_no_shows} no-show{patient.past_no_shows !== 1 ? 's' : ''}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${noShowBadgeColor(patient.past_no_shows)}`}>
                      {patient.past_no_shows >= 5 ? 'Critical' : patient.past_no_shows >= 3 ? 'Warning' : 'Monitor'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
