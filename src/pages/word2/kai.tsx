import React, { useState, useEffect } from 'react';
import { Word, WordBlock, AppMode } from '../../../types';
import { FileUpload } from './components/FileUpload';
import { BlockCard } from './components/BlockCard';
import { StudyMode } from './components/StudyMode';
import { BookOpen, Settings } from 'lucide-react';

const BLOCK_SIZE = 10;

// Helper to chunk array into blocks
const createBlocks = (words: Word[]): WordBlock[] => {
  const blocks: WordBlock[] = [];
  for (let i = 0; i < words.length; i += BLOCK_SIZE) {
    blocks.push({
      id: Math.floor(i / BLOCK_SIZE) + 1,
      words: words.slice(i, i + BLOCK_SIZE),
      status: i === 0 ? 'ready' : 'locked' // Unlock first block by default
    });
  }
  return blocks;
};

const App: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [blocks, setBlocks] = useState<WordBlock[]>([]);
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);

  // Handle File Load
  const handleWordsLoaded = (loadedWords: Word[]) => {
    setWords(loadedWords);
    const newBlocks = createBlocks(loadedWords);
    setBlocks(newBlocks);
  };

  // Start Study Block
  const startBlock = (blockId: number) => {
    // Update status to in-progress
    setBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, status: 'in-progress' } : b
    ));
    setActiveBlockId(blockId);
    setMode(AppMode.STUDY);
  };

  // Complete Block
  const completeBlock = () => {
    if (activeBlockId) {
      setBlocks(prev => prev.map(b => {
        if (b.id === activeBlockId) return { ...b, status: 'completed' };
        if (b.id === activeBlockId + 1) return { ...b, status: 'ready' }; // Unlock next
        return b;
      }));
      setMode(AppMode.HOME);
      setActiveBlockId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F0F4F8] relative shadow-2xl">
      
      {/* App Header (Sticky) */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BookOpen size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight">TEN BLOCK</h1>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col">
        
        {mode === AppMode.HOME && (
          <>
            {words.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">시작해볼까요?</h2>
                  <p className="text-slate-500">10개씩 쪼개서 외우면 금방 외워요!</p>
                </div>
                <FileUpload onWordsLoaded={handleWordsLoaded} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">나의 단어장</h2>
                    <p className="text-slate-500 text-sm">{blocks.filter(b => b.status === 'completed').length} / {blocks.length} Blocks 완료</p>
                  </div>
                  <button 
                    onClick={() => setWords([])} 
                    className="text-xs text-blue-500 underline"
                  >
                    파일 변경
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {blocks.map(block => (
                    <BlockCard 
                      key={block.id} 
                      block={block} 
                      onStart={startBlock} 
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {mode === AppMode.STUDY && activeBlockId && (
          <StudyMode 
            block={blocks.find(b => b.id === activeBlockId)!}
            onComplete={completeBlock}
            onBack={() => setMode(AppMode.HOME)}
          />
        )}

      </main>
    </div>
  );
};

export default App;
