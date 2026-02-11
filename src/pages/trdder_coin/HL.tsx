
import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_BALANCE, INITIAL_ASSETS } from './constants';
import { Asset, UserPortfolio, PricePoint, Holding, Transaction, MarketNews, AssetType } from '../../../types';
import StockChart from './components/StockChart';
import StockDetailModal from './components/StockDetailModal';
import AIAssistant from './components/AIAssistant';
import MarketMakerConsole from './components/MarketMakerConsole';
import { generateMarketNewsBatch } from './services/geminiService';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [portfolio, setPortfolio] = useState<UserPortfolio>({
    balance: INITIAL_BALANCE,
    holdings: [],
    transactions: []
  });
  const [news, setNews] = useState<MarketNews[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<AssetType>('STOCK');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const isFetchingNews = useRef(false);

  // Update selected asset reference
  useEffect(() => {
    if (selectedAsset) {
      const updated = assets.find(a => a.symbol === selectedAsset.symbol);
      if (updated) setSelectedAsset(updated);
    }
  }, [assets]);

  const applyNewsEffect = (newsItems: MarketNews[]) => {
    if (!newsItems.length) return;
    
    setNews(prev => [...newsItems, ...prev].slice(0, 150));

    setAssets(prevAssets => prevAssets.map(a => {
      let updatedSentiment = a.sentiment;
      newsItems.forEach((n) => {
        if (n.symbol === 'MARKET' || (n.symbol === 'CRYPTO' && a.type === 'COIN') || a.symbol === n.symbol) {
          const impactMultiplier = n.id.startsWith('manual-') ? 3.5 : 1.2;
          updatedSentiment = Math.max(-1.5, Math.min(1.5, updatedSentiment + n.sentiment * impactMultiplier));
        }
      });
      return { ...a, sentiment: updatedSentiment };
    }));
  };

  // 1. Bulk News Generation (Every 60 seconds - Adjusted for Quota)
  useEffect(() => {
    const fetchNewsBatch = async () => {
      if (isFetchingNews.current) return;
      isFetchingNews.current = true;
      
      try {
        const newsBatch = await generateMarketNewsBatch(assets.map(a => ({ symbol: a.symbol, name: a.name, type: a.type })));
        if (newsBatch && newsBatch.length > 0) {
          const timestamp = new Date();
          const newsWithIds = newsBatch.map((n: any) => ({
            ...n,
            id: Math.random().toString(36).substr(2, 9),
            timestamp
          }));
          applyNewsEffect(newsWithIds);
        }
      } finally {
        isFetchingNews.current = false;
      }
    };

    fetchNewsBatch();
    const newsTimer = setInterval(fetchNewsBatch, 60000); // Increased to 1 minute
    return () => clearInterval(newsTimer);
  }, []);

  // 2. EXTREME Volatility Simulation (Every 3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setAssets(prevAssets => prevAssets.map(asset => {
        const baseVol = asset.type === 'COIN' ? 0.065 : 0.025;
        const sentimentBias = asset.sentiment * (asset.type === 'COIN' ? 0.15 : 0.06);
        
        const randomWalk = (Math.random() - 0.5) * 2 * baseVol;
        const totalChange = randomWalk + sentimentBias;
        
        const newPrice = Math.max(0.01, asset.price * (1 + totalChange));
        const priceDiff = newPrice - asset.price;
        
        const initialAsset = INITIAL_ASSETS.find(a => a.symbol === asset.symbol)!;
        const changePercent = ((newPrice - initialAsset.price) / initialAsset.price) * 100;
        
        const newPoint: PricePoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          price: newPrice
        };

        const decayedSentiment = asset.sentiment * 0.96;

        return {
          ...asset,
          price: newPrice,
          change: priceDiff,
          changePercent: changePercent,
          sentiment: Math.abs(decayedSentiment) < 0.001 ? 0 : decayedSentiment,
          history: [...asset.history, newPoint].slice(-60)
        };
      }));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleTrade = (type: 'BUY' | 'SELL', quantity: number) => {
    if (!selectedAsset) return;
    const totalValue = selectedAsset.price * quantity;
    
    if (type === 'BUY') {
      if (portfolio.balance < totalValue) return;
      setPortfolio(prev => {
        const existingHolding = prev.holdings.find(h => h.symbol === selectedAsset.symbol);
        let updatedHoldings;
        if (existingHolding) {
          const newQty = existingHolding.quantity + quantity;
          const newAvg = (existingHolding.averagePrice * existingHolding.quantity + totalValue) / newQty;
          updatedHoldings = prev.holdings.map(h => h.symbol === selectedAsset.symbol ? { ...h, quantity: newQty, averagePrice: newAvg } : h);
        } else {
          updatedHoldings = [...prev.holdings, { symbol: selectedAsset.symbol, name: selectedAsset.name, type: selectedAsset.type, quantity, averagePrice: selectedAsset.price }];
        }
        return {
          balance: prev.balance - totalValue,
          holdings: updatedHoldings,
          transactions: [{ id: Math.random().toString(36).substr(2, 9), symbol: selectedAsset.symbol, name: selectedAsset.name, type: 'BUY', assetType: selectedAsset.type, quantity, price: selectedAsset.price, timestamp: new Date() }, ...prev.transactions]
        };
      });
    } else {
      const holding = portfolio.holdings.find(h => h.symbol === selectedAsset.symbol);
      if (!holding || holding.quantity < quantity) return;
      setPortfolio(prev => {
        const newQty = holding.quantity - quantity;
        const updatedHoldings = newQty === 0 ? prev.holdings.filter(h => h.symbol !== selectedAsset.symbol) : prev.holdings.map(h => h.symbol === selectedAsset.symbol ? { ...h, quantity: newQty } : h);
        return {
          balance: prev.balance + totalValue,
          holdings: updatedHoldings,
          transactions: [{ id: Math.random().toString(36).substr(2, 9), symbol: selectedAsset.symbol, name: selectedAsset.name, type: 'SELL', assetType: selectedAsset.type, quantity, price: selectedAsset.price, timestamp: new Date() }, ...prev.transactions]
        };
      });
    }
  };

  const totalAsset = portfolio.balance + portfolio.holdings.reduce((sum, h) => sum + (assets.find(a => a.symbol === h.symbol)?.price || 0) * h.quantity, 0);
  const profitLoss = totalAsset - INITIAL_BALANCE;
  const profitLossPercent = (profitLoss / INITIAL_BALANCE) * 100;

  return (
    <div className="min-h-screen pb-20 bg-[#020617] text-slate-200">
      <header className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-40 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">G</div>
            <h1 className="text-2xl font-black tracking-tighter text-white">GEMINI TRADER <span className="text-indigo-400">MAX</span></h1>
          </div>
          <div className="text-right flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Market Turbulence</span>
              <span className="text-lg font-mono font-bold text-red-500 animate-pulse">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Chaos Mode</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group border border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            <h2 className="text-xs font-black text-slate-500 mb-2 uppercase tracking-[0.3em]">Total Capital</h2>
            <div className="text-4xl font-black text-white mb-6 tracking-tighter">
              {totalAsset.toLocaleString()} <span className="text-sm font-medium opacity-40">KRW</span>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800">
              <div>
                <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Available Cash</div>
                <div className="text-lg font-bold text-slate-200">{portfolio.balance.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Net Profit</div>
                <div className={`text-lg font-black ${profitLoss >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </section>

          <AIAssistant />

          {/* News Feed */}
          <section className="bg-[#0f172a] rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <span className="flex h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
                Market Shock Feed
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {news.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-sm text-slate-500 uppercase tracking-widest">Waiting for impact...</div>
              ) : (
                news.map(item => (
                  <div key={item.id} className={`p-4 rounded-2xl border transition-all group ${
                    item.id.startsWith('manual-') ? 'bg-red-950/20 border-red-500/50 shadow-lg shadow-red-500/10' : 'bg-[#1e293b]/30 border-slate-800 hover:border-slate-700'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                          item.sentiment > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {item.symbol}
                        </span>
                        {item.id.startsWith('manual-') && (
                          <span className="text-[8px] text-red-400 font-black uppercase tracking-widest animate-pulse">[USER MANIPULATED]</span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-slate-600">{item.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-snug group-hover:text-white transition-colors">{item.title}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Market Tabs */}
          <div className="flex bg-[#0f172a] p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button 
              onClick={() => setActiveTab('STOCK')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${activeTab === 'STOCK' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Stock Market
            </button>
            <button 
              onClick={() => setActiveTab('COIN')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${activeTab === 'COIN' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Crypto Exchange
            </button>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assets.filter(a => a.type === activeTab).map(asset => (
              <div 
                key={asset.symbol} 
                onClick={() => setSelectedAsset(asset)} 
                className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-slate-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 cursor-pointer transition-all duration-500 group relative overflow-hidden"
              >
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-all duration-500 group-hover:opacity-30 ${asset.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>

                {Math.abs(asset.sentiment) > 0.1 && (
                  <div className={`absolute top-6 left-6 px-3 py-1 rounded-full text-[9px] font-black z-20 flex items-center gap-2 shadow-2xl border ${
                    asset.sentiment > 0 ? 'bg-green-500/20 border-green-500 text-green-400 animate-bounce' : 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                  }`}>
                    {asset.sentiment > 0 ? 'BULL RUN' : 'CRASH WARNING'}
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-8 pt-6">
                  <div>
                    <div className="text-[10px] font-black text-slate-500 mb-1 tracking-[0.2em] uppercase">{asset.symbol}</div>
                    <h4 className="font-black text-white text-2xl group-hover:text-indigo-400 transition-colors tracking-tighter">{asset.name}</h4>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-black text-2xl tracking-tighter ${asset.change >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                      {asset.price.toLocaleString(undefined, { maximumFractionDigits: asset.type === 'COIN' ? 2 : 0 })}
                    </div>
                    <div className={`text-xs font-black ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {asset.change >= 0 ? '▲' : '▼'} {Math.abs(asset.changePercent).toFixed(2)}%
                    </div>
                  </div>
                </div>

                {asset.history.length > 2 && (
                  <div className="h-32 opacity-40 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-[1.02]">
                    <StockChart data={asset.history} color={asset.change >= 0 ? '#10b981' : '#ef4444'} />
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Holdings */}
          <section className="bg-[#0f172a] rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-800 bg-slate-900/30">
              <h3 className="font-black text-xs text-slate-500 uppercase tracking-[0.3em]">Portfolio Intelligence</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-950 text-slate-500">
                  <tr>
                    <th className="px-8 py-5 text-left font-black uppercase text-[10px] tracking-widest">Asset Name</th>
                    <th className="px-8 py-5 text-right font-black uppercase text-[10px] tracking-widest">Buy Avg</th>
                    <th className="px-8 py-5 text-right font-black uppercase text-[10px] tracking-widest">Live Price</th>
                    <th className="px-8 py-5 text-right font-black uppercase text-[10px] tracking-widest">PnL %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {portfolio.holdings.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-700 font-black uppercase tracking-[0.2em] italic">No active positions detected.</td></tr>
                  ) : (
                    portfolio.holdings.map(h => {
                      const a = assets.find(as => as.symbol === h.symbol);
                      const profit = a ? (a.price - h.averagePrice) / h.averagePrice * 100 : 0;
                      return (
                        <tr key={h.symbol} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="font-black text-slate-200 group-hover:text-white transition-colors">{h.name}</div>
                            <div className="text-[10px] font-bold text-slate-600">{h.quantity.toLocaleString()} Units</div>
                          </td>
                          <td className="px-8 py-6 text-right font-bold text-slate-500">{h.averagePrice.toLocaleString()}</td>
                          <td className="px-8 py-6 text-right font-black text-slate-200">{a?.price.toLocaleString()}</td>
                          <td className={`px-8 py-6 text-right font-black ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {profit >= 0 ? '+' : ''}{profit.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {selectedAsset && (
        <StockDetailModal 
          stock={selectedAsset} 
          portfolio={portfolio} 
          news={news}
          onClose={() => setSelectedAsset(null)} 
          onTrade={handleTrade} 
        />
      )}

      <MarketMakerConsole 
        assets={assets}
        onInjectNews={(manualNews) => applyNewsEffect([manualNews])}
      />
    </div>
  );
};

export default App;
