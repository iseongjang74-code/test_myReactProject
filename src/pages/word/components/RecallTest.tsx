import React, { useState, useEffect, useRef } from 'react';
import { Timer, XCircle, CheckCircle, Trophy } from 'lucide-react';
import { Word } from '../../../../types';
import { audioService } from '../services/audioService';

interface Props {
  words: Word[];
  onFinish: (results: { correct: Word[], wrong: Word[] }) => void;
  isReverse: boolean; // Feature 5: Bidirectional support
  startIndex: number;
}

export const RecallTest: React.FC<Props> = ({ words, onFinish, isReverse, startIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'revealed'>('ready');
  const [correctWords, setCorrectWords] = useState<Word[]>([]);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentWord = words[currentIndex];
  const displayNumber = startIndex + currentIndex;

  useEffect(() => {
    if (gameState === 'playing') {
      setTimeLeft(3);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          audioService.playTick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, gameState]);

  const handleTimeout = () => {
    setGameState('revealed');
    audioService.playError();
  };

  const handleAnswer = (known: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (known) {
      audioService.playSuccess();
      setCorrectWords([...correctWords, currentWord]);
      nextWord();
    } else {
      audioService.playError();
      setGameState('revealed');
    }
  };

  const handleWrongConfirm = () => {
    setWrongWords([...wrongWords, currentWord]);
    nextWord();
  };

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setGameState('playing');
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish({ correct: correctWords, wrong: wrongWords });
    }
  };

  // Content Logic
  const questionContent = isReverse ? (
     <div className="flex flex-col items-center">
         <span className="text-slate-400 font-bold text-xl mb-4">#{displayNumber}</span>
         <h2 className="text-4xl font-bold text-slate-800 mb-6 tracking-tight leading-tight text-center">
            {currentWord.definition}
         </h2>
     </div>
  ) : (
     <div className="flex flex-col items-center">
        <span className="text-slate-400 font-bold text-xl mb-4">#{displayNumber}</span>
        <h2 className="text-5xl font-black text-slate-800 mb-6 tracking-tight leading-tight text-center">
            {currentWord.term}
        </h2>
     </div>
  );

  const answerContent = isReverse ? (
    <div className="animate-fade-in-up text-center">
      <div className="h-px w-12 bg-slate-200 mx-auto mb-6"></div>
      <p className="text-3xl font-black text-indigo-600">{currentWord.term}</p>
    </div>
  ) : (
    <div className="animate-fade-in-up text-center">
      <div className="h-px w-12 bg-slate-200 mx-auto mb-6"></div>
      <p className="text-2xl font-bold text-indigo-600">{currentWord.definition}</p>
      {currentWord.mnemonic && <p className="text-slate-500 mt-2 text-sm">"{currentWord.mnemonic}"</p>}
    </div>
  );

  if (gameState === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="mb-6 bg-indigo-100 p-6 rounded-full text-indigo-600 animate-bounce">
          <Timer size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">3초 회상 테스트</h2>
        <p className="text-slate-500 mb-2">
          {isReverse ? '뜻을 보고 3초 안에 영단어를 떠올리세요!' : '영단어를 보고 3초 안에 뜻을 떠올리세요!'}
        </p>
        <button 
          onClick={() => { audioService.playClick(); setGameState('playing'); }}
          className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition"
        >
          START!
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pt-10 pb-6 px-6 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="text-slate-400 font-medium text-sm">
          {currentIndex + 1} / {words.length}
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timeLeft <= 1 ? 'text-red-500' : 'text-slate-700'}`}>
          <Timer size={20} /> {timeLeft}s
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full px-4">
          {questionContent}
          {gameState === 'revealed' && answerContent}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-10 grid grid-cols-2 gap-4">
        {gameState === 'playing' ? (
          <>
            <button 
              onClick={() => handleAnswer(false)}
              className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition active:scale-95"
            >
              모르겠어요
            </button>
            <button 
              onClick={() => handleAnswer(true)}
              className="bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95"
            >
              알아요!
            </button>
          </>
        ) : (
           <button 
            onClick={handleWrongConfirm}
            className="col-span-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            오답 확인하고 계속하기 <XCircle size={18} />
          </button>
        )}
      </div>
    </div>
  );
};