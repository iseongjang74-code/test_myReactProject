
import { GoogleGenAI, Type } from "@google/genai";
import { AICommentary } from "../../../../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getGameOverCommentary(score: number): Promise<AICommentary> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player just finished a high-quality Snake game with a score of ${score}. Give them a witty, futuristic, and encouraging 1-sentence commentary in Korean and assign them a rank name (e.g., '데이터 수집가', '네온 포식자', '사이버 전설').`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            rank: { type: Type.STRING }
          },
          required: ["message", "rank"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("Gemini commentary failed", error);
    return {
      message: `게임 종료! 당신의 점수는 ${score}점입니다.`,
      rank: score > 100 ? "엘리트 스네이크" : "초보 웜"
    };
  }
}
