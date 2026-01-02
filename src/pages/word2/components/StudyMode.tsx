import React, { useState, useEffect } from 'react';
import { WordBlock, Word } from '../../../../types';
import { Volume2, ArrowRight, ArrowLeft, RotateCw } from 'lucide-react';
import { playClickSound, playFlipSound, speakText } from '../services/audio';

interface StudyModeProps {
  block: WordBlock;
  onComplete: () => void;
  onBack: () => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({ block, onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const currentWord: Word = block.words[currentIndex];
  const progress = ((currentIndex + 1) / block.words.length) * 100;

  useEffect(() => {
    // Reset flip state when word changes
    setIsFlipped(false);
  }, [currentIndex]);

  const handleFlip = () => {
    playFlipSound();
    setIsFlipped(!isFlipped);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playClickSound();
    if (currentIndex < block.words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    speakText(currentWord.term);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-full">
      {/* Header & Progress */}
      <div className="w-full flex items-center justify-between mb-6 px-4">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 p-2">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 mx-4 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-500 w-10 text-right">
          {currentIndex + 1}/{block.words.length}
        </span>
      </div>

      {/* Flashcard Area */}
      <div className="w-full px-4 mb-8 perspective-1000 flex-1 flex items-center justify-center">
        <div 
          onClick={handleFlip}
          className={`
            relative w-full aspect-[4/5] max-h-[500px] cursor-pointer card-flip
            ${isFlipped ? 'flipped' : ''}
          `}
        >
          <div className="card-inner w-full h-full relative shadow-xl rounded-3xl transition-all duration-500">
            
            {/* Front (English) */}
            <div className="card-front absolute w-full h-full bg-white rounded-3xl flex flex-col items-center justify-center p-8 border border-slate-100">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-8">English Term</span>
              
              {/* Dynamic Font Size for Long Words */}
              <h2 className={`font-bold text-slate-800 text-center mb-8 break-words w-full leading-tight ${currentWord.term.length > 12 ? 'text-3xl' : 'text-4xl'}`}>
                {currentWord.term}
              </h2>
              
              <button 
                onClick={handleSpeak}
                className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:scale-110 transition-all flex items-center justify-center shadow-sm"
              >
                <Volume2 size={32} />
              </button>

              <div className="absolute bottom-8 text-slate-300 text-sm flex items-center gap-2">
                <RotateCw size={14} />
                <span>Tap to flip</span>
              </div>
            </div>

            {/* Back (Definition) */}
            <div className="card-back absolute w-full h-full bg-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-white border border-slate-700">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Definition</span>
              <h2 className="text-3xl font-bold text-center break-words leading-relaxed">
                {currentWord.definition}
              </h2>
            </div>

          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full px-4 mb-6">
        <button 
          onClick={handleNext}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>{currentIndex === block.words.length - 1 ? 'Finish Block' : 'Next Word'}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};