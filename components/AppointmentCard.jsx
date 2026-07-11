'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import RiskBadge from './RiskBadge';

export default function AppointmentCard({ appointment, onRefresh }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id);
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const dateTime = new Date(appointment.datetime);
  const isToday = dateTime.toDateString() === new Date().toDateString();

  return (
    <div className={`px-6 py-4 hover:bg-gray-50 transition ${isToday ? 'bg-blue-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{appointment.patients?.name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            📅 {dateTime.toLocaleDateString()} at{' '}
            {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-gray-600">📱 {appointment.patients?.phone}</p>
        </div>
        <div className="flex items-center gap-4">
          <RiskBadge risk={appointment.no_show_risk} />
          <select
            value={appointment.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="no-show">No-Show</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  );
}
