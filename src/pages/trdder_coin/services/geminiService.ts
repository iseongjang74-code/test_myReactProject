
import { GoogleGenAI, Type } from "@google/genai";
import { AI_SYSTEM_INSTRUCTION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to wait for a specific duration
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic wrapper for Gemini API calls with exponential backoff for 429 errors
 */
async function callWithRetry(fn: () => Promise<any>, maxRetries = 3): Promise<any> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.code === 429;
      
      if (isRateLimit && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 2000 + Math.random() * 1000;
        console.warn(`Rate limit hit. Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function getMarketAnalysis(prompt: string, context?: any) {
  try {
    return await callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: AI_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
      return response.text;
    });
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "현재 API 사용량이 많아 분석 기능을 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
  }
}

export async function generateMarketNewsBatch(assets: {symbol: string, name: string, type: string}[]) {
  const assetList = assets.map(a => `${a.name}(${a.symbol}, ${a.type})`).join(", ");
  const prompt = `주식 및 코인 시장의 새로운 뉴스 5개를 생성해줘. 
  관련 대상은 다음 목록 중에서 선택하거나 전체 시장(MARKET), 가상화폐전체(CRYPTO)를 대상으로 할 수 있어: ${assetList}
  
  조건:
  1. 각 뉴스는 독립적이어야 함.
  2. 주식 호재/악재와 코인 급등락 소식을 적절히 섞을 것.
  3. 매우 자극적이고 전문적인 뉴스 헤드라인으로 작성할 것.
  
  반드시 다음 JSON 배열 형식으로만 응답해:
  [{ "title": "뉴스 제목", "symbol": "기호", "sentiment": -1.0 ~ 1.0 }]`;

  try {
    return await callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                symbol: { type: Type.STRING },
                sentiment: { type: Type.NUMBER }
              },
              required: ["title", "symbol", "sentiment"]
            }
          }
        },
      });
      return JSON.parse(response.text.trim());
    });
  } catch (error) {
    console.error("News Batch Generation Error:", error);
    return [];
  }
}
