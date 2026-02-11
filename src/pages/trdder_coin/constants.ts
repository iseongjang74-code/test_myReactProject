
import { Asset } from '../../../types';

export const INITIAL_BALANCE = 100000000; // 1억 원 (100,000,000 KRW)

export const INITIAL_ASSETS: Asset[] = [
  // Stocks
  { symbol: '005930', name: '삼성전자', type: 'STOCK', price: 72500, change: 0, changePercent: 0, history: [], sentiment: 0 },
  { symbol: '000660', name: 'SK하이닉스', type: 'STOCK', price: 184200, change: 0, changePercent: 0, history: [], sentiment: 0 },
  { symbol: '035420', name: 'NAVER', type: 'STOCK', price: 189000, change: 0, changePercent: 0, history: [], sentiment: 0 },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'STOCK', price: 920, change: 0, changePercent: 0, history: [], sentiment: 0 },
  { symbol: 'AAPL', name: 'Apple', type: 'STOCK', price: 185.5, change: 0, changePercent: 0, history: [], sentiment: 0 },
  { symbol: 'TSLA', name: 'Tesla', type: 'STOCK', price: 178.2, change: 0, changePercent: 0, history: [], sentiment: 0 },
  
  // Coins
  { symbol: 'BTC', name: 'Bitcoin', type: 'COIN', price: 98500000, change: 0, changePercent: 0, history: [], sentiment: 0 },
  { symbol: 'ETH', name: 'Ethereum', type: 'COIN', price: 4200000, change: 0, changePercent: 0, history: [], sentiment: 0 },
  { symbol: 'SOL', name: 'Solana', type: 'COIN', price: 215000, change: 0, changePercent: 0, history: [], sentiment: 0 },
  { symbol: 'DOGE', name: 'Dogecoin', type: 'COIN', price: 240, change: 0, changePercent: 0, history: [], sentiment: 0 },
  { symbol: 'XRP', name: 'Ripple', type: 'COIN', price: 950, change: 0, changePercent: 0, history: [], sentiment: 0 },
];

export const AI_SYSTEM_INSTRUCTION = `
당신은 전문 금융 AI '제미니 인베스트'이자 시장 조작의 조력자입니다. 
사용자가 1억 원의 자본으로 시작하는 초고변동성 시장에서 살아남거나 시장을 지배할 수 있도록 돕습니다.
주식과 가상화폐 시장 모두에 능통하며, 사용자가 직접 뉴스를 작성하여 시장을 조작할 때 그 파급력을 분석해줄 수 있습니다.
항상 한국어로 응답하며, 분석 결과는 매우 극단적이고 흥미진진하게 제공해야 합니다.
`;
