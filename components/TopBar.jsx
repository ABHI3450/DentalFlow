'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Calendar, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const dropdownRef = useRef(null);

  const notifications = [
    {
      id: 1,
      type: 'risk',
      icon: AlertTriangle,
      iconColor: 'text-amber-500 bg-amber-50',
      title: 'High No-Show Risk',
      desc: 'Patient Robert Vance has a High no-show probability for today.',
      time: '15 mins ago'
    },
    {
      id: 2,
      type: 'sms',
      icon: MessageSquare,
      iconColor: 'text-blue-500 bg-blue-50',
      title: 'SMS Reminder Sent',
      desc: 'Sent automated SMS reminder to Sarah Connor.',
      time: '1 hour ago'
    },
    {
      id: 3,
      type: 'confirm',
      icon: CheckCircle,
      iconColor: 'text-emerald-500 bg-emerald-50',
      title: 'Appointment Confirmed',
      desc: 'John Doe confirmed his slot for tomorrow at 10:00 AM.',
      time: '2 hours ago'
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between mb-8 gap-4 relative z-30">
      {/* Search Input */}
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-sm flex-1 max-w-md border border-gray-200">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search patients, records, appointments..."
          className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2" ref={dropdownRef}>
        {/* Notification Bell */}
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            setHasUnread(false); // Mark as read on open
          }}
          className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition relative focus:outline-none"
        >
          <Bell size={15} className="text-gray-600" />
          {hasUnread && (
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => router.push('/settings')}
          className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition focus:outline-none"
          title="Open Settings"
        >
          <Settings size={15} className="text-gray-600" />
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-gray-150 rounded-2xl shadow-xl py-3 px-1 text-left mt-1.5 transform origin-top-right transition-all">
            <div className="flex items-center justify-between px-3 pb-2 border-b border-gray-100 mb-2">
              <span className="text-xs font-bold text-gray-900">Notifications</span>
              <button 
                onClick={() => setHasUnread(false)}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-1">
              {notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div key={notif.id} className="flex gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition">
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${notif.iconColor}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 flex justify-between gap-2">
                        <span className="truncate">{notif.title}</span>
                        <span className="text-[9px] text-gray-400 font-normal shrink-0">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-normal line-clamp-2">
                        {notif.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
