'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname() || '';

  // Check if current path is a public page (landing, signin, signup, legal policy pages)
  const isPublic = 
    pathname === '/' ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/refunds') ||
    pathname.startsWith('/contact');

  if (isPublic) {
    return (
      <main className="min-h-screen w-full bg-[#FAF9F6]">
        {children}
      </main>
    );
  }

  // Authenticated/dashboard pages get the sidebar layout
  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F6]">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen bg-[#FAF9F6]">
        {children}
      </main>
    </div>
  );
}
