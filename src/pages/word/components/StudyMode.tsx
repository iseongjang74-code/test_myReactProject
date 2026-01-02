import React, { useState } from 'react';
import { Volume2, RotateCw, ChevronRight, Lightbulb } from 'lucide-react';
import { Word } from '../../../../types';
import { audioService } from '../services/audioService';

interface Props {
  words: Word[];
  onComplete: () => void;
  isReverse: boolean; // Feature 5: Bidirectional support
  startIndex: number;
}

export const StudyMode: React.FC<Props> = ({ words, onComplete, isReverse, startIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex) / words.length) * 100;
  
  // Current numbering (e.g. 1. Apple)
  const displayNumber = startIndex + currentIndex;

  const handleFlip = () => {
    audioService.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    audioService.playClick();
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    } else {
      onComplete();
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always speak the English term regardless of card side/mode for learning
    audioService.speak(currentWord.term);
  };

  const frontText = isReverse ? currentWord.definition : currentWord.term;
  const backText = isReverse ? currentWord.term : currentWord.definition;

  return (
    <div className="flex flex-col h-full pt-6 pb-6 px-6 max-w-md mx-auto w-full">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
          <span>PROGRESS</span>
          <span>{currentIndex + 1} / {words.length}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 relative perspective-1000 mb-6 group cursor-pointer" onClick={handleFlip}>
        <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* FRONT */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 backface-hidden flex flex-col items-center justify-center p-8">
            <div className="text-center w-full">
              {/* Word Numbering Badge */}
              <div className="inline-block bg-slate-100 text-slate-500 font-black text-sm px-3 py-1 rounded-full mb-6">
                 #{displayNumber}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight break-words leading-tight">
                {frontText}
              </h2>
              
              {/* Only show sound button if Front is English (Normal mode) */}
              {!isReverse && (
                <button 
                  onClick={handleSpeak}
                  className="mt-2 p-4 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors inline-flex items-center justify-center group-hover:scale-110 transform duration-300"
                >
                  <Volume2 size={28} />
                </button>
              )}
            </div>
            
            <div className="absolute bottom-8 text-slate-400 text-sm font-bold flex items-center gap-2 animate-pulse">
              <RotateCw size={16} /> 탭해서 뜻 보기
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 w-full h-full bg-slate-900 text-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8">
            <div className="text-center w-full">
                <div className="inline-block bg-white/10 text-white/60 font-bold text-xs px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
                    Answer
                </div>
                
                <h2 className="text-3xl font-bold mb-6 break-words leading-snug">
                    {backText}
                </h2>
                
                {/* Only show sound button if Back is English (Reverse mode) */}
                {isReverse && (
                    <button 
                    onClick={handleSpeak}
                    className="mb-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors inline-flex items-center justify-center"
                    >
                    <Volume2 size={24} />
                    </button>
                )}

                {/* Context/Example/Story */}
                <div className="w-full bg-white/10 rounded-xl p-4 backdrop-blur-sm text-left mt-2">
                    {currentWord.mnemonic && (
                        <div className="mb-3 pb-3 border-b border-white/10">
                            <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold mb-1">
                                <Lightbulb size={14} /> MEMORY STORY
                            </div>
                            <p className="text-sm leading-relaxed opacity-90 font-medium">
                                {currentWord.mnemonic}
                            </p>
                        </div>
                    )}
                    
                    {currentWord.example ? (
                        <div>
                            <p className="text-xs text-slate-400 font-bold mb-1">EXAMPLE</p>
                            <p className="text-sm italic opacity-80 leading-relaxed">"{currentWord.example}"</p>
                        </div>
                    ) : (
                        <div className="text-center text-xs text-slate-500 py-1">No example available</div>
                    )}
                </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-center">
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          다음 카드 <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};