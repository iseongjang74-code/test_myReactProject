import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config({ path: '.env.local' });
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('No GEMINI_API_KEY found in .env.local');
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

try {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: 'Say: hello' }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64 && base64.length > 100) {
    console.log('✅ Gemini TTS OK (audio base64 length:', base64.length, ')');
  } else if (base64 && base64.length > 0) {
    console.warn('⚠️ Gemini TTS returned small audio payload (length:', base64.length, ')');
  } else {
    console.error('❌ No audio data in TTS response');
    process.exit(2);
  }
} catch (err) {
  console.error('❌ TTS request failed:');
  console.error(err?.toString ? err.toString() : String(err));
  process.exit(2);
}
