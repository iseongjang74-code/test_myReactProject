
import React, { useState, useEffect } from 'react';
import { GameState, KeyConfig } from '../../../../types';
import { Battery, Key, Volume2, Settings, X, Keyboard } from 'lucide-react';
import { AudioEngine } from '../utils/AudioEngine';

interface UIOverlayProps {
  gameState: GameState;
  stats: {
    battery: number;
    keysFound: number;
    totalKeys: number;
    soundLevel: number;
    message: string;
  };
  onStart: () => void;
  onRestart: () => void;
  keyBindings: KeyConfig;
  setKeyBindings: (config: KeyConfig) => void;
}

const ACTION_LABELS: Record<keyof KeyConfig, string> = {
  MOVE_FORWARD: 'Move Forward',
  MOVE_BACKWARD: 'Move Backward',
  MOVE_LEFT: 'Move Left',
  MOVE_RIGHT: 'Move Right',
  RUN: 'Sprint',
  SNEAK: 'Sneak',
  INTERACT: 'Interact',
  FLASHLIGHT: 'Toggle Camera Light'
};

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  stats, 
  onStart, 
  onRestart,
  keyBindings,
  setKeyBindings
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [rebindingAction, setRebindingAction] = useState<keyof KeyConfig | null>(null);
  const [time, setTime] = useState(0);

  // Timecode counter
  useEffect(() => {
    let interval: any;
    if (gameState === 'PLAYING') {
        interval = setInterval(() => {
            setTime(t => t + 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const formatTimecode = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${hrs}:${mins}:${secs}`;
  };

  const handleStartWithAudio = () => {
      AudioEngine.getInstance().resume();
      onStart();
  };

  // Handle Key Rebinding
  useEffect(() => {
    if (!rebindingAction) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Cancel on Escape
      if (e.key === 'Escape') {
        setRebindingAction(null);
        return;
      }

      setKeyBindings({
        ...keyBindings,
        [rebindingAction]: e.code
      });
      setRebindingAction(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rebindingAction, keyBindings, setKeyBindings]);

  const formatKey = (code: string) => {
    return code.replace('Key', '').replace('Left', '').replace('Right', '').replace('Control', 'Ctrl');
  };
    
  if (gameState === 'MENU') {
    if (showSettings) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-slate-100 z-[100] p-8 pointer-events-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-2xl relative">
             <button 
                onClick={() => { setShowSettings(false); setRebindingAction(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
             >
               <X size={32} />
             </button>

             <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-red-500" style={{ fontFamily: 'Special Elite' }}>
               <Keyboard size={32} /> CONTROLS
             </h2>

             <div className="grid grid-cols-2 gap-4">
               {(Object.keys(keyBindings) as Array<keyof KeyConfig>).map((action) => (
                 <div key={action} className="flex items-center justify-between bg-black/50 p-3 rounded border border-slate-800">
                   <span className="text-slate-300 font-mono text-sm uppercase">{ACTION_LABELS[action]}</span>
                   <button 
                     onClick={() => setRebindingAction(action)}
                     className={`px-4 py-1 rounded font-bold min-w-[100px] text-center transition-colors border ${
                       rebindingAction === action 
                         ? 'bg-red-600 border-red-400 text-white animate-pulse' 
                         : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                     }`}
                   >
                     {rebindingAction === action ? 'PRESS KEY...' : formatKey(keyBindings[action])}
                   </button>
                 </div>
               ))}
             </div>

             <div className="mt-8 text-center text-slate-500 text-sm">
               Click a button to rebind. Press ESC to cancel.
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-slate-100 z-[100] pointer-events-auto">
        <h1 className="text-8xl font-bold tracking-widest text-red-600 mb-4 animate-pulse" style={{ fontFamily: 'Special Elite' }}>LAST LIGHT</h1>
        <p className="text-xl mb-8 max-w-md text-center text-slate-400">
          Find 12 keys to escape. Keep your flashlight charged. Don't look at it.
        </p>
        
        <div className="flex flex-col gap-4 w-64">
             <button 
               onClick={handleStartWithAudio}
               className="bg-red-900/50 border-2 border-red-600 hover:bg-red-800 text-white py-3 rounded text-xl font-bold transition-all hover:scale-105"
             >
               ENTER DARKNESS
             </button>
             <button 
               onClick={() => setShowSettings(true)}
               className="bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 py-2 rounded flex items-center justify-center gap-2"
             >
               <Settings size={18} /> CONTROLS
             </button>
        </div>
      </div>
    );
  } else if (gameState === 'GAME_OVER') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[100] pointer-events-auto animate-in fade-in duration-1000">
            {/* YOU DIED TEXT */}
            <div className="scale-150 mb-12">
                 <h1 className="text-9xl font-serif text-red-900 tracking-widest opacity-80" style={{ textShadow: '0 0 20px rgba(255,0,0,0.5)' }}>YOU DIED</h1>
            </div>
             <button 
               onClick={onRestart}
               className="mt-8 text-slate-400 hover:text-white border-b border-transparent hover:border-white transition-colors text-xl"
             >
               TRY AGAIN
             </button>
        </div>
      );
  } else if (gameState === 'VICTORY') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-black z-[100] pointer-events-auto animate-in fade-in duration-[3000ms]">
             <h1 className="text-6xl font-bold mb-4">ESCAPED</h1>
             <p className="text-2xl mb-8">You found the light.</p>
             <button 
               onClick={onRestart}
               className="bg-black text-white px-8 py-3 rounded hover:scale-105 transition-transform"
             >
               PLAY AGAIN
             </button>
        </div>
      );
  }

  // HUD
  return (
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
         {/* Top Bar */}
         <div className="flex justify-between items-start">
             <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-3 text-red-500 text-2xl drop-shadow-md">
                    <Battery size={32} />
                    <span className="font-mono font-bold">{Math.ceil(stats.battery)}%</span>
                 </div>
                 <div className="flex items-center gap-3 text-yellow-500 text-2xl drop-shadow-md">
                    <Key size={32} />
                    <span className="font-mono font-bold">{stats.keysFound}/{stats.totalKeys}</span>
                 </div>
             </div>
             
             <div className="flex flex-col items-end gap-1">
                 <div className="text-slate-500 font-mono text-xl">{formatTimecode(time)}</div>
                 {/* Sound Meter */}
                 <div className="flex items-center gap-2">
                     <Volume2 size={20} className={stats.soundLevel > 0.5 ? "text-red-500" : "text-slate-600"} />
                     <div className="w-32 h-2 bg-slate-900 border border-slate-700">
                         <div 
                           className="h-full bg-slate-200 transition-all duration-100" 
                           style={{ width: `${Math.min(100, stats.soundLevel * 100)}%` }}
                         />
                     </div>
                 </div>
             </div>
         </div>

         {/* Center Message */}
         {stats.message && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <div className="text-white font-mono text-xl bg-black/50 px-4 py-2 rounded border border-slate-700 animate-pulse">
                     {stats.message}
                 </div>
             </div>
         )}

         {/* Bottom Controls Hint */}
         <div className="text-slate-600 font-mono text-sm opacity-50">
             {formatKey(keyBindings.FLASHLIGHT)}: LIGHT | {formatKey(keyBindings.INTERACT)}: INTERACT
         </div>
      </div>
  );
};
