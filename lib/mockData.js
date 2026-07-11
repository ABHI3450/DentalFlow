// lib/mockData.js
// SINGLE SOURCE OF TRUTH for all mock data.
// Every page imports from here so numbers are consistent everywhere.
// Once you connect Supabase, replace these exports with real DB calls
// (you already have lib/supabase.js functions like getAppointments, getPatients).

export const patients = [
  { id: 'p1', name: 'Sarah Johnson', phone: '+1 555 010 2001', email: 'sarah.j@email.com', pastNoShows: 0, lastVisit: '2026-06-12' },
  { id: 'p2', name: 'Michael Chen', phone: '+1 555 010 2002', email: 'michael.c@email.com', pastNoShows: 1, lastVisit: '2026-05-28' },
  { id: 'p3', name: 'Emma Davis', phone: '+1 555 010 2003', email: 'emma.d@email.com', pastNoShows: 2, lastVisit: '2026-04-15' },
  { id: 'p4', name: 'James Wilson', phone: '+1 555 010 2004', email: 'james.w@email.com', pastNoShows: 0, lastVisit: '2026-06-30' },
  { id: 'p5', name: 'Lisa Anderson', phone: '+1 555 010 2005', email: 'lisa.a@email.com', pastNoShows: 1, lastVisit: '2026-06-01' },
];

export const appointments = [
  { id: 'a1', patientId: 'p1', patientName: 'Sarah Johnson', type: 'Routine Checkup', datetime: '2026-07-09T10:00:00', status: 'Confirmed', risk: 'Low' },
  { id: 'a2', patientId: 'p2', patientName: 'Michael Chen', type: 'Root Canal', datetime: '2026-07-09T11:30:00', status: 'Pending', risk: 'Medium' },
  { id: 'a3', patientId: 'p3', patientName: 'Emma Davis', type: 'Cavity Filling', datetime: '2026-07-09T14:00:00', status: 'Scheduled', risk: 'High' },
  { id: 'a4', patientId: 'p4', patientName: 'James Wilson', type: 'Checkup', datetime: '2026-07-09T15:30:00', status: 'Confirmed', risk: 'Low' },
  { id: 'a5', patientId: 'p5', patientName: 'Lisa Anderson', type: 'Cleaning', datetime: '2026-07-10T09:00:00', status: 'Pending', risk: 'Medium' },
];

export const notifications = [
  { id: 'n1', text: 'Sarah Johnson confirmed her 10:00 AM appointment', time: '5m ago', read: false },
  { id: 'n2', text: 'Michael Chen has not confirmed — reminder sent', time: '1h ago', read: false },
  { id: 'n3', text: 'Emma Davis marked as high no-show risk', time: '3h ago', read: true },
];

// Computed stats — derived from the arrays above so every page agrees
export function getStats() {
  const today = new Date('2026-07-09').toDateString();
  const todayAppointments = appointments.filter(
    (a) => new Date(a.datetime).toDateString() === today
  );
  const confirmed = appointments.filter((a) => a.status === 'Confirmed').length;
  const highRisk = appointments.filter((a) => a.risk === 'High').length;
  const confirmRate = Math.round((confirmed / appointments.length) * 100);

  return {
    todayCount: todayAppointments.length,
    confirmRate,
    highRisk,
    activePatients: patients.length,
  };
}
