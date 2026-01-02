import { GoogleGenAI, Type } from "@google/genai";
import { Word } from "../../../../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateSampleWords = async (): Promise<Word[]> => {
  const ai = getClient();
  
  // Updated prompt for Feature 7 (Storytelling)
  const prompt = "Generate a list of 10 English vocabulary words for a middle school student. For each word, provide: 1. The English term. 2. A Korean definition. 3. A short, simple English example sentence. 4. A 'mnemonic' (story) in Korean that helps memorize the word using pronunciation associations or logic (e.g. 'Stalactite' -> 'C' for Ceiling -> 천장에 붙은 종유석).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING },
              example: { type: Type.STRING },
              mnemonic: { type: Type.STRING },
            },
            required: ["term", "definition", "example", "mnemonic"],
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    
    return rawData.map((item: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      term: item.term,
      definition: item.definition,
      example: item.example,
      mnemonic: item.mnemonic,
      status: 'new'
    }));

  } catch (error) {
    console.error("Error generating words:", error);
    return [];
  }
};