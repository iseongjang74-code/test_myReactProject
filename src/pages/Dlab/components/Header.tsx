
import React from 'react';

interface HeaderProps {
  onHome: () => void;
  onHistory: () => void;
  onGuide: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHome, onHistory, onGuide }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 glass px-6 py-4 flex justify-between items-center border-b border-white/5">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={onHome}
      >
        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
          T-M
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          틀<span className="text-emerald-400">(렸)</span>니 맞<span className="text-emerald-400">(췄)</span>니
        </h1>
      </div>
      <nav className="flex gap-4 md:gap-8 text-sm font-bold text-slate-400">
        <button onClick={onHome} className="hover:text-emerald-400 transition-colors">홈</button>
        <button onClick={onHistory} className="hover:text-emerald-400 transition-colors">기록</button>
        <button onClick={onGuide} className="hover:text-emerald-400 transition-colors">가이드</button>
      </nav>
    </header>
  );
};

export default Header;
