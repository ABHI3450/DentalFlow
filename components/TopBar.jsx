'use client';

import { Search, Bell, Settings } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="flex items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-sm flex-1 max-w-md border border-gray-200">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search patients, records, appointments..."
          className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition relative">
          <Bell size={15} className="text-gray-600" />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
        </button>
        <button className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
          <Settings size={15} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
