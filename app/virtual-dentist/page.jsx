import VirtualDentistWidget from '@/components/VirtualDentistWidget';

export default function VirtualDentistPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-2">Virtual Dentist</h1>
      <p className="text-sm text-gray-500 mb-6">
        Ask our live AI assistant about dental symptoms, treatments, oral care, or when to book an appointment.
      </p>

      <div style={{ height: '600px' }}>
        <VirtualDentistWidget />
      </div>
    </div>
  );
}
