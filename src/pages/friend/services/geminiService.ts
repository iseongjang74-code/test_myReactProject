
import { GoogleGenAI, Type } from "@google/genai";
import { SocialFriend } from "../../../../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFriendInsights = async (friend: SocialFriend) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `내 친구 ${friend.name}에 대한 정보를 바탕으로 몇 가지를 제안해줘.
    관계: ${friend.relationship}
    메모: ${friend.notes || '없음'}
    
    1. 이 친구에게 어울리는 귀엽거나 재치 있는 별명 3개
    2. 이 친구에게 보내면 좋을 따뜻한 안부 인사말 한 문장
    
    JSON 형식으로 응답해줘.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nicknames: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 unique nicknames in Korean"
          },
          message: {
            type: Type.STRING,
            description: "A friendly greeting message in Korean"
          }
        },
        required: ["nicknames", "message"]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text.trim());
};
