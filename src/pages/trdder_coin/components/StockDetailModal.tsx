
import React, { useState } from 'react';
import { Asset, UserPortfolio, MarketNews } from '../../../../types';
import StockChart from './StockChart';

interface StockDetailModalProps {
  stock: Asset; // Name kept as stock for minimal prop change but uses Asset type
  portfolio: UserPortfolio;
  news: MarketNews[];
  onClose: () => void;
  onTrade: (type: 'BUY' | 'SELL', quantity: number) => void;
}

const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, portfolio, news, onClose, onTrade }) => {
  const [quantity, setQuantity] = useState<number>(stock.type === 'COIN' ? 0.01 : 1);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const holding = portfolio.holdings.find(h => h.symbol === stock.symbol);
  const maxBuy = portfolio.balance / stock.price;
  const maxSell = holding ? holding.quantity : 0;

  // Filter news related to this asset or the whole market/crypto
  const relatedNews = news.filter(n => 
    n.symbol === stock.symbol || 
    n.symbol === 'MARKET' || 
    (stock.type === 'COIN' && n.symbol === 'CRYPTO')
  );

  const handleTrade = () => {
    if (quantity <= 0) return;
    if (tradeType === 'BUY' && quantity > maxBuy) return;
    if (tradeType === 'SELL' && quantity > maxSell) return;
    
    onTrade(tradeType, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
      <div className="bg-[#1e293b] rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row transform transition-all border border-slate-800">
        
        {/* Information Section */}
        <div className="flex-1 p-8 lg:p-12 border-r border-slate-800 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${stock.type === 'COIN' ? 'bg-orange-500/20 text-orange-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  {stock.type}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${stock.sentiment > 0 ? 'text-green-400' : stock.sentiment < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  {stock.sentiment > 0 ? '● BULLISH BIAS' : stock.sentiment < 0 ? '● BEARISH BIAS' : '● NEUTRAL'}
                </span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter">{stock.name} <span className="text-slate-500 opacity-50">{stock.symbol}</span></h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex items-baseline gap-4 mb-10">
            <span className="text-5xl font-black text-white tracking-tighter">{stock.price.toLocaleString()}</span>
            <span className={`text-2xl font-bold ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
            </span>
          </div>

          <div className="bg-[#0f172a] rounded-[2rem] p-6 mb-10 border border-slate-800 shadow-inner">
            <div className="h-64">
              <StockChart data={stock.history} color={stock.change >= 0 ? '#10b981' : '#ef4444'} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <span className="h-1 w-8 bg-indigo-500 rounded-full"></span>
              Sentiment Analysis & News
            </h3>
            <div className="grid gap-4">
              {relatedNews.length === 0 ? (
                <p className="text-slate-500 italic text-sm">No recent signals detected.</p>
              ) : (
                relatedNews.map(n => (
                  <div key={n.id} className="p-5 rounded-[1.5rem] border border-slate-800 bg-[#0f172a] hover:border-indigo-500/30 transition-all group">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${n.sentiment > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {n.symbol}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600">{n.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">{n.title}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Trading Section */}
        <div className="w-full lg:w-[420px] bg-[#0f172a] p-10 flex flex-col shadow-2xl">
          <div className="flex bg-[#1e293b] p-1.5 rounded-2xl mb-10 border border-slate-800">
            <button 
              onClick={() => setTradeType('BUY')}
              className={`flex-1 py-4 rounded-xl font-black text-sm transition-all ${tradeType === 'BUY' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              매수
            </button>
            <button 
              onClick={() => setTradeType('SELL')}
              className={`flex-1 py-4 rounded-xl font-black text-sm transition-all ${tradeType === 'SELL' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              매도
            </button>
          </div>

          <div className="space-y-8 flex-1">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available</span>
                <span className="text-sm font-bold text-white">
                  {tradeType === 'BUY' ? `${portfolio.balance.toLocaleString()} KRW` : `${maxSell} ${stock.symbol}`}
                </span>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  step={stock.type === 'COIN' ? "0.0001" : "1"}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#1e293b] border border-slate-800 rounded-3xl px-6 py-6 text-3xl font-black text-white focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <button 
                    onClick={() => setQuantity(tradeType === 'BUY' ? maxBuy : maxSell)}
                    className="px-4 py-2 bg-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-xl border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800">
              <div className="flex justify-between items-center mb-2 px-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimated Total</span>
              </div>
              <div className={`text-4xl font-black text-right tracking-tighter ${tradeType === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                {(stock.price * quantity).toLocaleString()} <span className="text-xs font-medium opacity-40">KRW</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleTrade}
            disabled={quantity <= 0 || (tradeType === 'BUY' ? quantity > maxBuy : quantity > maxSell)}
            className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition transform active:scale-95 disabled:opacity-30 disabled:grayscale ${
              tradeType === 'BUY' ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
            }`}
          >
            CONFIRM {tradeType}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;
