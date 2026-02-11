import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load .env.local specifically
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('No GEMINI_API_KEY found in .env.local');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

try {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Return exactly {"status":"ok"} as a JSON object (no extra text).',
    config: { responseMimeType: 'application/json' }
  });

  const text = response.text ?? '';
  // Do a light parse check without printing full text
  if (text.trim().startsWith('{') && text.includes('status')) {
    console.log('✅ Gemini text generation OK (response length:', text.length, ')');
  } else {
    console.warn('⚠️ Unexpected response shape. Response snippet:', text.slice(0, 200));
  }
} catch (err) {
  console.error('❌ Gemini API request failed:');
  console.error(err?.toString ? err.toString() : String(err));
  process.exit(2);
}
