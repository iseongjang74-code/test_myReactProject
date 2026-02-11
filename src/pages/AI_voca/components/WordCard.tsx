
import React, { useState } from 'react';
import { VocabularyWord } from '../../../../types';
import { generateSpeech, decodeAudioData } from '../services/geminiService';

interface WordCardProps {
  word: VocabularyWord;
}

const WordCard: React.FC<WordCardProps> = ({ word }) => {
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handlePlayAudio = async () => {
    if (isAudioLoading) return;
    setIsAudioLoading(true);
    try {
      const audioData = await generateSpeech(word.word);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await decodeAudioData(new Uint8Array(audioData), audioCtx, 24000, 1);
      
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
      
      source.onended = () => {
        setIsAudioLoading(false);
        audioCtx.close();
      };
    } catch (error) {
      console.error("Audio error:", error);
      setIsAudioLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {word.word}
          </h2>
          <button
            onClick={handlePlayAudio}
            disabled={isAudioLoading}
            className={`p-2 rounded-full transition-all ${
              isAudioLoading ? 'bg-slate-100' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
            }`}
            title="Listen Pronunciation"
          >
            {isAudioLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            )}
          </button>
        </div>
        
        <p className="text-slate-400 font-mono text-sm mb-3">[{word.phonetic}]</p>
        
        <div className="mb-4">
          <p className="text-indigo-600 font-bold text-lg mb-1">{word.koreanTranslation}</p>
          <p className="text-slate-600 text-sm leading-relaxed italic">"{word.definition}"</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Example</p>
          <p className="text-slate-800 text-sm font-medium">
            {word.exampleSentence}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
        >
          {showDetails ? 'Hide Details' : 'View Synonyms & Tips'}
          <span className={`transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Synonyms</p>
              <div className="flex flex-wrap gap-2">
                {word.synonyms.map((s, i) => (
                  <span key={i} className="bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Usage Tip</p>
              <p className="text-slate-600 text-xs italic leading-snug bg-amber-50 p-2 rounded-lg border border-amber-100">
                {word.usageTip}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordCard;
