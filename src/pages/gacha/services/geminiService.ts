
import { GoogleGenAI } from "@google/genai";
import { Character } from "../../../../types";

export const getTeamAdvice = async (characters: Character[]): Promise<string> => {
  try {
    // FIX: Per guidelines, initialize with process.env.API_KEY directly and remove mock response for missing key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const characterList = characters.map(c => `- ${c.name} (${c.rarity}, ${c.attribute})`).join('\n');
    const prompt = `
      당신은 뛰어난 RPG 전략가입니다. 아래의 보유 캐릭터 목록을 보고, 균형 잡히고 강력한 4인 팀을 추천해 주세요.
      선택된 캐릭터들 간의 전략과 시너지에 대해 설명해 주세요. 응답은 마크다운 형식으로 작성해 주세요.

      보유 캐릭터 목록:
      ${characterList}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // FIX: Updated error message to be more generic and not mention API keys, as per guidelines.
    return "죄송합니다, 지금은 조언을 받을 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }
};
