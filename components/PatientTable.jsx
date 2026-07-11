'use client';

export default function PatientTable({ patients, onEdit, onDelete }) {
  if (!patients || patients.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-gray-500 text-sm">No patients found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {patients.map(patient => (
            <tr key={patient.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{patient.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{patient.email || '—'}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(patient.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm space-x-3">
                <button
                  onClick={() => onEdit(patient)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(patient.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
