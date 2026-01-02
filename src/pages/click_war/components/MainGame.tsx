
import React, { useState, useEffect, useRef } from 'react';
import { TimeLeft, LeaderboardData, AutoClickTier } from '../../../../types';
import Leaderboard from './Leaderboard';
import AutoClickStore from './AutoClickStore';
import PromotionalBanner from './PromotionalBanner';
import LightningIcon from './icons/LightningIcon';
import StarIcon from './icons/StarIcon';
import { AUTO_CLICK_TIERS, GOD_MODE_INTERVAL_MS, MAX_LEVEL, COUNTRY_THEMES } from '../constants';
import { getFlagEmoji, getCountryCode } from '../utils';

interface MainGameProps {
  userCountry: string;
  userClicks: number;
  leaderboard: LeaderboardData;
  timeLeft: TimeLeft;
  onIncrement: () => void;
  autoClickTier: AutoClickTier | null;
  onPurchaseTier: (tier: AutoClickTier) => void;
  isGodModeActive: boolean;
  onToggleGodMode: () => void;
  isAutoClickEnabled: boolean;
  onToggleAutoClick: () => void;
}

const ClickEffect: React.FC<{ x: number; y: number; id: number; value: string }> = ({ x, y, id, value }) => (
  <div
    key={id}
    className="absolute text-yellow-400 font-black text-5xl pointer-events-none z-50 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
    style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)', animation: 'click-float 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
  >
    +{value}
  </div>
);

const MainGame: React.FC<MainGameProps> = ({
  userCountry,
  userClicks,
  leaderboard,
  timeLeft,
  onIncrement,
  autoClickTier,
  onPurchaseTier,
  isGodModeActive,
  onToggleGodMode,
  isAutoClickEnabled,
  onToggleAutoClick
}) => {
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [clickEffects, setClickEffects] = useState<{ x: number, y: number, id: number, value: string }[]>([]);
  const autoClickInterval = useRef<number | null>(null);

  const userLevel = Math.min(MAX_LEVEL, Math.floor(Math.sqrt(userClicks / 10)) + 1);

  useEffect(() => {
    if (autoClickInterval.current) {
      clearInterval(autoClickInterval.current);
      autoClickInterval.current = null;
    }

    if (isAutoClickEnabled) {
      if (isGodModeActive) {
        autoClickInterval.current = setInterval(() => {
          onIncrement();
        }, GOD_MODE_INTERVAL_MS);
      } else if (autoClickTier) {
        const tierInfo = AUTO_CLICK_TIERS.find(t => t.id === autoClickTier);
        if (tierInfo) {
          autoClickInterval.current = setInterval(() => {
            onIncrement();
          }, tierInfo.intervalMs);
        }
      }
    }

    return () => {
      if (autoClickInterval.current) {
        clearInterval(autoClickInterval.current);
      }
    };
  }, [autoClickTier, onIncrement, isGodModeActive, isAutoClickEnabled]);

  const handleManualClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onIncrement();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const clickValue = 1 + (userLevel - 1) * 0.05;
    const newEffect = { x, y, id: Date.now(), value: clickValue.toFixed(2) };
    
    setClickEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(e => e.id !== newEffect.id));
    }, 800);
  };

  const totalGlobalClicks: number = (Object.values(leaderboard) as number[]).reduce((sum, clicks) => sum + clicks, 0);
  const countryClicks: number = (leaderboard[userCountry] as number) || 0;

  const currentTierInfo = autoClickTier ? AUTO_CLICK_TIERS.find(t => t.id === autoClickTier) : null;
  const theme = COUNTRY_THEMES[userCountry] || COUNTRY_THEMES.default;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white selection:bg-yellow-500 selection:text-gray-900">
      <PromotionalBanner />
      <div className="flex flex-col lg:flex-row items-stretch justify-center flex-grow p-4 lg:p-12 gap-12 max-w-7xl mx-auto w-full">
        
        {/* Core Interaction Side */}
        <div className="flex flex-col items-center w-full lg:w-3/5 space-y-10">
          <header className="text-center animate-fade-in space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 tracking-tighter uppercase leading-none">
              Global Click War
            </h1>
            <div className="inline-flex items-center gap-4 bg-gray-900 border border-gray-800 py-3 px-8 rounded-[2rem] shadow-2xl">
              <span className="text-5xl drop-shadow-xl">{getFlagEmoji(getCountryCode(userCountry))}</span>
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-0.5">Your Nation</p>
                <p className="text-2xl font-black uppercase tracking-tight leading-none">{userCountry}</p>
              </div>
            </div>
          </header>

          <div className="w-full max-w-sm bg-gray-900/50 backdrop-blur p-6 rounded-[2rem] border border-gray-800 shadow-inner text-center">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Operation Window Ends In</h3>
            <div className="text-4xl font-mono font-black text-yellow-400 tabular-nums tracking-tight">
              <span>{String(timeLeft.days).padStart(2, '0')}d </span>
              <span>{String(timeLeft.hours).padStart(2, '0')}h </span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}m </span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-10 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity animate-pulse"></div>
            <button
              onClick={handleManualClick}
              className={`relative w-72 h-72 md:w-96 md:h-96 rounded-full flex items-center justify-center font-black text-6xl shadow-2xl transform active:scale-90 active:rotate-2 transition-all duration-75 select-none overflow-hidden border-[12px] border-gray-950/80 ${theme.button} ${theme.text}`}
            >
              TAP
              {clickEffects.map(effect => <ClickEffect key={effect.id} {...effect} />)}
            </button>
          </div>

          <div className="text-center space-y-1">
            <div className="flex justify-center items-center gap-3">
              <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Your Contribution</span>
              <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                <span className="text-[10px] text-yellow-500 font-black">RANK LVL {userLevel}</span>
              </div>
            </div>
            <p className="text-7xl font-black font-mono tracking-tighter drop-shadow-lg text-white">
              {Math.floor(userClicks).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => setIsStoreOpen(true)}
                className="flex flex-col items-center justify-center gap-2 p-6 bg-gray-900 rounded-3xl hover:bg-gray-800 transition-all border border-gray-800 hover:border-yellow-500/50 group"
              >
                <LightningIcon className="w-8 h-8 text-yellow-500 group-hover:scale-125 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Armory Store</span>
              </button>
              <button
                onClick={onToggleGodMode}
                className={`flex flex-col items-center justify-center gap-2 p-6 rounded-3xl transition-all border ${
                  isGodModeActive 
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_30px_rgba(147,51,234,0.3)]' 
                    : 'bg-gray-900 border-gray-800 hover:border-purple-500/50'
                }`}
              >
                <StarIcon className={`w-8 h-8 ${isGodModeActive ? 'fill-purple-400' : 'text-gray-600'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">God Mode</span>
              </button>
            </div>

            <div className="flex items-center justify-between w-full px-6 py-4 bg-gray-900 border border-gray-800 rounded-3xl shadow-xl">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Auto-Tapper Status</span>
                <span className={`text-[11px] font-black uppercase ${isAutoClickEnabled ? 'text-green-500' : 'text-gray-500'}`}>
                  {isAutoClickEnabled ? (isGodModeActive ? 'Overdrive (100/s)' : `${currentTierInfo?.name || 'Standard'} Active`) : 'Manual Only'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isAutoClickEnabled} onChange={onToggleAutoClick} className="sr-only peer" />
                <div className="w-16 h-8 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600 shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Global Intel Side */}
        <div className="flex flex-col items-center w-full lg:w-2/5 space-y-8">
          <div className="w-full bg-gray-900/50 border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{userCountry} National Score</h3>
              <p className="text-5xl font-black font-mono text-white tabular-nums tracking-tighter">
                {Math.floor(countryClicks).toLocaleString()}
              </p>
              <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.5)]" 
                  style={{ width: `${Math.min(100, (countryClicks / (totalGlobalClicks || 1)) * 1000)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-800 space-y-1">
              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Total Global Impact</h3>
              <p className="text-4xl font-black font-mono text-white/30 tabular-nums tracking-tighter">
                {Math.floor(totalGlobalClicks).toLocaleString()}
              </p>
            </div>
          </div>
          
          <Leaderboard leaderboard={leaderboard} userCountry={userCountry} />
        </div>

        <style>{`
          @keyframes click-float {
            0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
            15% { opacity: 1; transform: translate(-50%, -100%) scale(1.3); }
            100% { transform: translate(-50%, -250%) scale(1.6); opacity: 0; }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>
      </div>
      {isStoreOpen && (
        <AutoClickStore
          currentTier={autoClickTier}
          onPurchase={onPurchaseTier}
          onClose={() => setIsStoreOpen(false)}
        />
      )}
    </div>
  );
};

export default MainGame;
