'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, Calendar, Users, BarChart2, Stethoscope,
  FileText, MessageCircle, CreditCard, FolderOpen, Settings, LogOut
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

const generalItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/dashboard/appointments', icon: Calendar, label: 'Schedule' },
  { href: '/dashboard/patients', icon: Users, label: 'Patients' },
  { href: '/statistics', icon: BarChart2, label: 'Statistics & reports' },
  { href: '/virtual-dentist', icon: Stethoscope, label: 'Virtual Dentist' },
  { href: '/records', icon: FileText, label: 'Records' },
];

const toolItems = [
  { href: '/chats', icon: MessageCircle, label: 'Chats & calls' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/documents', icon: FolderOpen, label: 'Documents' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside
      className="w-64 fixed left-0 top-0 h-screen flex flex-col py-6 px-4 border-r border-gray-200 overflow-y-auto scrollbar-hide z-40"
      style={{ backgroundColor: '#FAF9F6' }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-2 mb-8 hover:opacity-85 transition cursor-pointer">
        <span className="w-2.5 h-2.5 rounded-full bg-[#1C1C1E]"></span>
        <span className="text-[#1C1C1E] font-bold text-lg italic">DentalFlow</span>
      </Link>

      {/* General */}
      <p className="text-[10px] text-gray-400 font-semibold tracking-wider px-3 mb-2">
        GENERAL
      </p>
      <nav className="space-y-1 mb-6">
        {generalItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? 'bg-[#1C1C1E] text-white'
                  : 'text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Tools */}
      <p className="text-[10px] text-gray-400 font-semibold tracking-wider px-3 mb-2">
        TOOLS
      </p>
      <nav className="space-y-1 flex-1">
        {toolItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? 'bg-[#1C1C1E] text-white'
                  : 'text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={() => signOut({ redirectUrl: '/signin' })}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200/60 transition mt-4"
      >
        <LogOut size={16} />
        Log out
      </button>
    </aside>
  );
}
