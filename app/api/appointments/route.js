import { auth } from '@clerk/nextjs/server';
import { supabase, getAppointments, createAppointment, updateAppointment, deleteAppointment, getClinicByEmail } from '@/lib/supabase';
import { scoreNoShowRisk } from '@/lib/gemini';

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  try {
    const userEmail = req.headers.get('x-user-email');
    const clinicRes = await getClinicByEmail(userEmail);
    if (!clinicRes?.data?.id) return new Response('Clinic not found', { status: 404 });

    const { searchParams } = new URL(req.url);
    const filters = {};
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    if (status) filters.status = status;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    const { data, error } = await getAppointments(clinicRes.data.id, filters);
    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error('GET appointments error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  try {
    const body = await req.json();
    const { patientId, datetime, status = 'scheduled' } = body;

    const userEmail = req.headers.get('x-user-email');
    const clinicRes = await getClinicByEmail(userEmail);
    if (!clinicRes?.data?.id) return new Response('Clinic not found', { status: 404 });

    const { data, error } = await createAppointment(clinicRes.data.id, patientId, datetime, status);
    if (error) throw error;

    // Calculate no-show risk
    const { data: patientData } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patientData) {
      const riskLevel = await scoreNoShowRisk({
        pastNoShows: patientData.past_no_shows || 0,
        dayOfWeek: new Date(datetime).toLocaleDateString('en-US', { weekday: 'long' }),
        timeOfDay: new Date(datetime).getHours() < 12 ? 'morning' : 'afternoon',
        appointmentCount: patientData.last_appointment_date ? 1 : 0,
      });
      await updateAppointment(data[0].id, { no_show_risk: riskLevel });
      data[0].no_show_risk = riskLevel;
    }

    return Response.json(data[0], { status: 201 });
  } catch (error) {
    console.error('POST appointment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    const { data, error } = await updateAppointment(id, updates);
    if (error) throw error;
    return Response.json(data[0]);
  } catch (error) {
    console.error('PUT appointment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const { error } = await deleteAppointment(id);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error('DELETE appointment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
