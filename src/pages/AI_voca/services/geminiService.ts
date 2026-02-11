
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserLevel, VocabularyWord } from "../../../../types";

// Note: process.env.API_KEY is handled via Vite (GEMINI_API_KEY). Throw helpful error if missing.
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error('Missing GEMINI_API_KEY. Set GEMINI_API_KEY in .env.local (or your environment) and restart the dev server.');
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchRecommendedWords = async (
  level: UserLevel,
  interests: string[]
): Promise<VocabularyWord[]> => {
  const ai = getAI();
  const prompt = `Act as an expert English language tutor. 
  Recommend 6 high-quality English vocabulary words for a student at the ${level} level.
  Their interests include: ${interests.join(', ')}.
  Provide the output in a structured JSON format. 
  Each word should include: 
  - word
  - phonetic (IPA)
  - definition (in simple English)
  - koreanTranslation (natural Korean translation)
  - exampleSentence (using the word in a relevant context)
  - synonyms (at least 2)
  - usageTip (a short note on how to use it naturally)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  phonetic: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  koreanTranslation: { type: Type.STRING },
                  exampleSentence: { type: Type.STRING },
                  synonyms: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  usageTip: { type: Type.STRING }
                },
                required: ["word", "phonetic", "definition", "koreanTranslation", "exampleSentence", "synonyms", "usageTip"]
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{"words": []}');
    return data.words;
  } catch (error) {
    console.error("Error fetching words:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data received from Gemini TTS. Check your GEMINI_API_KEY and model availability.");

    // Decoding base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
