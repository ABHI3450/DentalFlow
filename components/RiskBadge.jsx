'use client';

export default function RiskBadge({ risk }) {
  if (!risk) return null;

  const classes = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const icons = { low: '✅', medium: '⚠️', high: '❌' };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${classes[risk] || 'bg-gray-100 text-gray-800'}`}>
      <span>{icons[risk]}</span>
      {risk.charAt(0).toUpperCase() + risk.slice(1)}
    </span>
  );
}
