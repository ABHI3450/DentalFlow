import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];

const SYSTEM_INSTRUCTION = `You are an expert virtual dental assistant for DentalFlow, a dental clinic management app.

Your role:
- Answer ANY question the user asks — dental symptoms, oral hygiene, procedures, costs, insurance, appointment timing, pediatric dentistry, orthodontics, emergencies, and general health questions related to teeth and gums.
- Give clear, thorough, helpful answers. Use as many sentences as needed to fully address the question.
- Be warm, professional, and easy to understand. Use plain language, not heavy medical jargon.
- For emergencies (severe pain, facial swelling, uncontrolled bleeding, knocked-out tooth), clearly say to seek urgent dental or ER care immediately.
- You may give general educational guidance but always note that only an in-person dentist can diagnose and treat specific conditions.
- If a question is completely unrelated to health or dentistry, politely redirect: you specialize in dental and oral health topics.
- Never refuse to answer a reasonable dental or health-related question.`;

function getApiKey() {
  return process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
}

export function hasGeminiKey() {
  const apiKey = getApiKey();
  return Boolean(apiKey && apiKey !== 'test' && apiKey.trim().length > 10);
}

function getClient() {
  const apiKey = getApiKey();
  if (!hasGeminiKey()) return null;
  return new GoogleGenerativeAI(apiKey);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const message = error?.message || '';
  return message.includes('503') || message.includes('500');
}

async function generateWithFallback(contents, generationConfig) {
  const client = getClient();
  if (!client) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
  }

  let lastError;

  for (const modelName of MODELS) {
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig,
    });

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const result = await model.generateContent({ contents });
        const answer = result.response.text()?.trim();
        if (answer) {
          return { answer, model: modelName };
        }
      } catch (error) {
        lastError = error;
        const msg = error?.message || '';
        if (msg.includes('429') || msg.includes('quota')) {
          throw error;
        }
        if (isRetryableError(error) && attempt === 0) {
          await sleep(2000);
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini models failed to generate a response');
}

function buildContents(question, history = []) {
  const contents = [];

  for (const msg of history) {
    if (!msg?.text?.trim()) continue;
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text.trim() }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: question.trim() }],
  });

  return contents;
}

/**
 * Virtual Dentist chat — live Gemini with conversation history.
 */
export async function askVirtualDentist(question, history = []) {
  if (!hasGeminiKey()) {
    return {
      answer: 'Live AI is not configured. Add a valid GOOGLE_GEMINI_API_KEY to your .env.local file and restart the server.',
      mode: 'error',
    };
  }

  try {
    const contents = buildContents(question, history);
    const { answer, model } = await generateWithFallback(contents, {
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

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
 * Generate a personalized reminder message using AI
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
    const { answer } = await generateWithFallback(
      [{ role: 'user', parts: [{ text: prompt }] }],
      { temperature: 0.8, maxOutputTokens: 200 }
    );
    return answer || fallback;
  } catch (error) {
    console.error('Gemini reminder error:', error);
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
