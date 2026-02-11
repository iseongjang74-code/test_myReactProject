
import React, { useState } from 'react';
import { Asset, MarketNews } from '../../../../types';
import { getMarketAnalysis } from '../services/geminiService';

interface MarketMakerConsoleProps {
  assets: Asset[];
  onInjectNews: (news: MarketNews) => void;
}

const MarketMakerConsole: React.FC<MarketMakerConsoleProps> = ({ assets, onInjectNews }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetSymbol, setTargetSymbol] = useState('MARKET');
  const [sentiment, setSentiment] = useState(0.5);
  const [headline, setHeadline] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInject = () => {
    if (!headline.trim()) return;

    const newNews: MarketNews = {
      id: 'manual-' + Math.random().toString(36).substr(2, 9),
      title: headline,
      symbol: targetSymbol,
      sentiment: sentiment,
      timestamp: new Date()
    };

    onInjectNews(newNews);
    setHeadline('');
    // Optionally close after inject
    // setIsOpen(false);
  };

  const generateAITitle = async () => {
    setIsGenerating(true);
    const targetAsset = assets.find(a => a.symbol === targetSymbol);
    const targetName = targetAsset ? targetAsset.name : (targetSymbol === 'MARKET' ? '전체 시장' : '가상화폐 시장');
    const mood = sentiment > 0 ? '엄청난 호재' : '충격적인 악재';
    
    const prompt = `${targetName}(${targetSymbol})에 대한 ${mood} 뉴스 헤드라인을 하나만 작성해줘. 
    실제 뉴스 기사 제목처럼 자극적이고 전문적이어야 해. 
    응답은 오직 뉴스 제목 문자열만 보내줘.`;

    const aiTitle = await getMarketAnalysis(prompt);
    setHeadline(aiTitle.replace(/"/g, '').trim());
    setIsGenerating(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-red-500 rotate-45' : 'bg-indigo-600'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      {/* Console Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Market Maker Console</h3>
          </div>

          <div className="space-y-6">
            {/* Target Selection */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Select Target</label>
              <select 
                value={targetSymbol}
                onChange={(e) => setTargetSymbol(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <optgroup label="General" className="bg-slate-800">
                  <option value="MARKET">Market (General)</option>
                  <option value="CRYPTO">Crypto (General)</option>
                </optgroup>
                <optgroup label="Stocks" className="bg-slate-800">
                  {assets.filter(a => a.type === 'STOCK').map(a => (
                    <option key={a.symbol} value={a.symbol}>{a.name} ({a.symbol})</option>
                  ))}
                </optgroup>
                <optgroup label="Coins" className="bg-slate-800">
                  {assets.filter(a => a.type === 'COIN').map(a => (
                    <option key={a.symbol} value={a.symbol}>{a.name} ({a.symbol})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Sentiment Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sentiment Intensity</label>
                <span className={`text-xs font-bold ${sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sentiment > 0 ? 'Positive' : 'Negative'} ({sentiment.toFixed(2)})
                </span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.1"
                value={sentiment}
                onChange={(e) => setSentiment(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[8px] text-slate-600 mt-1 font-bold">
                <span>CRASH</span>
                <span>NEUTRAL</span>
                <span>MOON</span>
              </div>
            </div>

            {/* Headline Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">News Headline</label>
                <button 
                  onClick={generateAITitle}
                  disabled={isGenerating}
                  className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-tighter flex items-center gap-1"
                >
                  {isGenerating ? 'GENERATING...' : 'AI Auto-Generate'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </button>
              </div>
              <textarea 
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="시장 뉴스 제목을 입력하세요..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
              />
            </div>

            <button 
              onClick={handleInject}
              disabled={!headline.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              Inject Into Market
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketMakerConsole;
