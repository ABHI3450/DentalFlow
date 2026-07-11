'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const { userId } = useAuth();
  const router = useRouter();

  if (!userId) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-bold text-lg text-indigo-600 hover:text-indigo-700">
              DentalRemind
            </Link>
            <div className="hidden md:flex gap-6">
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/dashboard/appointments" label="Appointments" />
              <NavLink href="/dashboard/patients" label="Patients" />
              <NavLink href="/dashboard/settings" label="Settings" />
              <NavLink href="/dashboard/billing" label="Billing" />
            </div>
          </div>
          <UserButton fallbackRedirectUrl="/signin" />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }) {
  return (
    <Link href={href} className="text-gray-700 hover:text-indigo-600 text-sm font-medium transition">
      {label}
    </Link>
  );
}