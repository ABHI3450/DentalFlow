export default function StatCard({ title, value, icon, trend, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl border p-6 transition hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{trend}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}