
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const generateSpotTheDifference = async (prompt: string, difficulty: 'easy' | 'medium' | 'hard') => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // 1. 원본 이미지 생성
  const basePrompt = `${prompt}. High quality, detailed, clear lighting.`;
  const baseResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: basePrompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  let originalBase64 = "";
  for (const part of baseResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) originalBase64 = part.inlineData.data;
  }

  if (!originalBase64) throw new Error("Base image generation failed");

  // 2. 변형 이미지 생성 (원본을 바탕으로)
  const count = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
  const modPrompt = `Look at the attached image. Create a new version of this image that is exactly the same, but with ${count} VERY subtle differences. Changes could be: changing a small object's color, removing a tiny detail, slightly moving an item, or changing the time on a clock. Keep the overall composition identical.`;

  const modResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: originalBase64, mimeType: 'image/png' } },
        { text: modPrompt }
      ]
    }
  });

  let modifiedBase64 = "";
  for (const part of modResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) modifiedBase64 = part.inlineData.data;
  }

  // 3. 차이점 설명 텍스트 (Gemini 3 Flash 활용)
  const textAi = new GoogleGenAI({ apiKey: API_KEY });
  const descResponse = await textAi.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `List ${count} differences between an original and a modified version of an image based on the prompt "${prompt}". Each difference should be a short sentence in Korean. Return as a plain list.`,
  });

  const diffs = descResponse.text?.split('\n').filter(s => s.trim().length > 0) || [];

  return {
    originalImage: `data:image/png;base64,${originalBase64}`,
    modifiedImage: `data:image/png;base64,${modifiedBase64}`,
    differencesDescription: diffs
  };
};
