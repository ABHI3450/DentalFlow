import { redirect } from 'next/navigation';

export default function PatientsRedirect() {
  redirect('/dashboard/patients');
}
