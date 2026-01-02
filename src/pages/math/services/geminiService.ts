
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Puzzle } from "../../../../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PUZZLE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.STRING,
      description: "탈출 게임 스타일의 짧은 서사적 배경 (1-2문장, 한국어로 작성).",
    },
    question: {
      type: Type.STRING,
      description: "해결해야 할 수학적 패턴 문제 (한국어로 작성).",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "정확히 4개의 객관식 선택지.",
    },
    correctAnswer: {
      type: Type.STRING,
      description: "options 배열 중 정확한 정답.",
    },
    hint: {
      type: Type.STRING,
      description: "사용자를 돕기 위한 최소한의 힌트 (한국어로 작성).",
    },
    explanation: {
      type: Type.STRING,
      description: "패턴에 대한 간략한 논리적 설명 (한국어로 작성).",
    }
  },
  required: ["story", "question", "options", "correctAnswer", "hint", "explanation"],
};

export async function generatePuzzle(difficulty: Difficulty, stage: number): Promise<Puzzle> {
  const prompt = `
    당신은 "수학 퍼즐 탈출"이라는 모바일 앱의 AI 퍼즐 디자이너입니다.
    ${difficulty} 난이도의 수학 패턴 퍼즐을 생성하세요. 모든 텍스트는 한국어로 작성해야 합니다.
    
    현재 스테이지: ${stage}
    
    난이도 가이드라인:
    - 쉬움: 단순 수열, 더하기/빼기 패턴, 기본적인 시각적 논리.
    - 보통: 다단계 규칙, 혼합 연산 (예: 곱하기 후 더하기), 제곱수, 소수 수열.
    - 어려움: 추상적 논리, 숨겨진 제약 조건, 복잡한 수열 (피보나치 유사, 다층 차이), 대수적 패턴 인식.
    
    이야기 테마: 탈출 게임, 미스터리, 첨단 금고, 고대 사원 중 하나를 선택하세요.
    질문: 명확하지만 도전적이어야 합니다.
    
    반드시 수학적으로 정확해야 하며 정답은 하나여야 합니다.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PUZZLE_SCHEMA,
        temperature: 0.9,
      },
    });

    return JSON.parse(response.text.trim()) as Puzzle;
  } catch (error) {
    console.error("퍼즐 생성 실패:", error);
    return {
      story: "벽에 알 수 없는 숫자들이 적혀 있습니다. 마지막 숫자를 알아내야 문이 열릴 것 같습니다.",
      question: "다음 수열을 완성하세요: 2, 4, 8, 16, ?",
      options: ["24", "30", "32", "64"],
      correctAnswer: "32",
      hint: "각 숫자는 이전 숫자의 두 배입니다.",
      explanation: "공비가 2인 등비수열입니다."
    };
  }
}
