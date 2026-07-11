import { NextResponse } from 'next/server';
import { askVirtualDentist } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { question, history } = await request.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const safeHistory = Array.isArray(history)
      ? history.filter((m) => m && (m.role === 'user' || m.role === 'ai') && typeof m.text === 'string')
      : [];

    const result = await askVirtualDentist(question.trim(), safeHistory.slice(-10));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Virtual Dentist route error:', error);
    return NextResponse.json(
      {
        answer: 'Something went wrong reaching the AI service. Please try again.',
        mode: 'error',
      },
      { status: 500 }
    );
  }
}
