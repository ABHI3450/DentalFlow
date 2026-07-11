'use client';

import RiskBadge from './RiskBadge';

export default function AppointmentTable({ appointments, onEdit, onDelete }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-gray-500 text-sm">No appointments found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {appointments.map(apt => (
            <tr key={apt.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{apt.patients?.name || '—'}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(apt.datetime).toLocaleDateString()}{' '}
                {new Date(apt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{apt.patients?.phone || '—'}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  apt.status === 'confirmed'  ? 'bg-green-100 text-green-800' :
                  apt.status === 'no-show'    ? 'bg-red-100 text-red-800' :
                  apt.status === 'completed'  ? 'bg-blue-100 text-blue-800' :
                  apt.status === 'cancelled'  ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                }`}>
                  {apt.status}
                </span>
              </td>
              <td className="px-6 py-4"><RiskBadge risk={apt.no_show_risk} /></td>
              <td className="px-6 py-4 text-sm space-x-3">
                <button onClick={() => onEdit(apt)} className="text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                <button onClick={() => onDelete(apt.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
