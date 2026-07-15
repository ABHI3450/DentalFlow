const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];

const SYSTEM_INSTRUCTION = `You are an expert virtual dental assistant for DentalFlow, a dental clinic management app.

Your role:
- Answer ANY question the user asks — dental symptoms, oral hygiene, procedures, costs, insurance, appointment timing, pediatric dentistry, orthodontics, emergencies, and general health questions related to teeth and gums.
- Give clear, thorough, helpful answers. Use as many sentences as needed to fully address the question.
- Be warm, professional, and easy to understand. Use plain language, not heavy medical jargon.
- For emergencies (severe pain, facial swelling, uncontrolled bleeding, knocked-out tooth), clearly say to seek urgent dental or ER care immediately.
- You may give general educational guidance but always note that only an in-person dentist can diagnose and treat specific conditions.
- If a question is completely unrelated to health or dentistry, politely redirect: you specialize in dental and oral health topics.
- Never refuse to answer a reasonable dental or health-related question.`;

export function hasGeminiKey() {
  return Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 10);
}

async function generateWithGroq(messages, maxTokens = 1024, temperature = 0.7) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  let lastError;

  for (const modelName of MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `Groq API returned status ${res.status}`);
      }

      const answer = data.choices?.[0]?.message?.content?.trim();
      if (answer) {
        return { answer, model: modelName };
      }
    } catch (err) {
      console.error(`Groq error for model ${modelName}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Groq models failed to generate a response');
}

/**
 * Virtual Dentist chat — live Groq AI with conversation history.
 */
export async function askVirtualDentist(question, history = []) {
  if (!hasGeminiKey()) {
    return {
      answer: 'Live AI is not configured. Add a valid GROQ_API_KEY to your Vercel settings and restart the server.',
      mode: 'error',
    };
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION }
    ];

    for (const msg of history) {
      if (!msg?.text?.trim()) continue;
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text.trim()
      });
    }

    messages.push({
      role: 'user',
      content: question.trim()
    });

    const { answer, model } = await generateWithGroq(messages, 1024, 0.7);
    return { answer, mode: 'live', model };
  } catch (error) {
    console.error('Virtual Dentist AI error:', error);
    return {
      answer: `Live AI is temporarily unavailable (${error.message?.slice(0, 120) || 'unknown error'}). Please try again in a moment.`,
      mode: 'error',
    };
  }
}

/**
 * Generate a personalized reminder message using AI (Groq)
 */
export async function generateReminderMessage(clinicName, patientName, appointmentTime) {
  const timeStr = new Date(appointmentTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fallback = `Hi ${patientName}, reminder: your appointment with ${clinicName} is on ${timeStr}. See you soon!`;

  if (!hasGeminiKey()) return fallback;

  const prompt = `You are a friendly dental clinic receptionist. Generate a SHORT, WARM (2-3 sentences max) SMS reminder message for a patient about their upcoming appointment.

Clinic: ${clinicName}
Patient: ${patientName}
Appointment: ${timeStr}

Be casual, friendly, and include the clinic name. Keep it under 140 characters for SMS.
Only output the message text, nothing else.`;

  try {
    const { answer } = await generateWithGroq([
      { role: 'user', content: prompt }
    ], 200, 0.8);
    return answer || fallback;
  } catch (error) {
    console.error('Groq reminder error:', error);
    return fallback;
  }
}

/**
 * Score no-show risk for an appointment using a simple heuristic
 * Returns 'low', 'medium', or 'high'
 */
export async function scoreNoShowRisk(appointmentData) {
  const {
    pastNoShows = 0,
    dayOfWeek = 'Monday',
    timeOfDay = 'morning',
    appointmentCount = 0,
  } = appointmentData;

  let score = 0;

  if (pastNoShows >= 2) score += 3;
  else if (pastNoShows === 1) score += 1;

  if (['Friday', 'Monday'].includes(dayOfWeek)) score += 1;
  if (timeOfDay === 'afternoon') score += 0.5;
  if (appointmentCount === 0) score -= 0.5;

  if (score >= 3) return 'high';
  if (score >= 1.5) return 'medium';
  return 'low';
}
