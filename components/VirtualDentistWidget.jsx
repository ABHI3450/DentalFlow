'use client';

import { useState } from 'react';
import { Send, Stethoscope } from 'lucide-react';

const suggestedQuestions = [
  'What causes tooth sensitivity?',
  'How do I treat bleeding gums?',
  'When should I get a root canal?',
];

export default function VirtualDentistWidget() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hi! I'm your live Virtual Dentist assistant. Ask me anything about dental symptoms, treatments, oral care, appointments, or emergencies.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null);

  const sendMessage = async (text) => {
    const question = text || input;
    if (!question.trim() || loading) return;

    const history = messages.filter((m) => m.role === 'user' || m.role === 'ai');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/virtual-dentist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response (timeout/offline).');
      }

      const data = await res.json();

      if (!res.ok) {
        setMode('error');
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: data.answer || data.error || 'Unable to reach the AI service. Please try again.' },
        ]);
        return;
      }

      setMode(data.mode || 'live');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: data.answer || "I couldn't generate a response. Please try again." },
      ]);
    } catch (err) {
      setMode('error');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: err.message || "I couldn't reach the server just now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const modeLabel =
    mode === 'live' ? '● Live AI' : mode === 'error' ? '● AI unavailable' : null;

  const modeClass =
    mode === 'live'
      ? 'bg-green-100 text-green-700'
      : mode === 'error'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';

  return (
    <div className="card border border-gray-200 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#1C1C1E] flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1C1C1E]">Virtual Dentist</p>
            <p className="text-[10px] text-gray-400">Live AI assistant</p>
          </div>
        </div>
        {modeLabel && (
          <span className={`text-[9px] font-semibold px-2 py-1 rounded-full ${modeClass}`}>
            {modeLabel}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 mb-4 max-h-64">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-xs p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
              m.role === 'ai'
                ? 'bg-gray-100 text-gray-700 mr-auto'
                : 'bg-[#1C1C1E] text-white ml-auto'
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="text-xs p-3 rounded-2xl bg-gray-100 text-gray-400 mr-auto max-w-[85%]">
            Thinking...
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask anything about dental health..."
          className="input-base text-xs flex-1"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-[#1C1C1E] flex items-center justify-center shrink-0 hover:bg-gray-800 transition disabled:opacity-50"
        >
          <Send size={14} className="text-white" />
        </button>
      </div>
    </div>
  );
}
