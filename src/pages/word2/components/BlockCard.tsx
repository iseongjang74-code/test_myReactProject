import React from 'react';
import { WordBlock } from '../../../../types';
import { Lock, Play, CheckCircle } from 'lucide-react';
import { playClickSound } from '../services/audio';

interface BlockCardProps {
  block: WordBlock;
  onStart: (blockId: number) => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({ block, onStart }) => {
  const isLocked = block.status === 'locked';
  const isCompleted = block.status === 'completed';

  const handleClick = () => {
    if (!isLocked) {
      playClickSound();
      onStart(block.id);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-2xl p-6 transition-all duration-300
        ${isLocked ? 'bg-slate-100 opacity-70 cursor-not-allowed' : 'bg-white cursor-pointer hover:shadow-lg hover:-translate-y-1'}
        ${block.status === 'in-progress' ? 'ring-2 ring-blue-400' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
          ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}
        `}>
          {block.id}
        </div>
        {isLocked && <Lock className="text-slate-400" size={20} />}
        {isCompleted && <CheckCircle className="text-green-500" size={24} />}
        {!isLocked && !isCompleted && <Play className="text-blue-400" size={24} />}
      </div>
      
      <h3 className="text-slate-800 font-bold text-lg mb-1">Block {block.id}</h3>
      <p className="text-slate-500 text-sm">{block.words.length} Words</p>

      {/* Progress Bar (Cognitive Feedback: Goal Gradient) */}
      {block.status === 'in-progress' && (
        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-400 w-1/3"></div> 
        </div>
      )}
    </div>
  );
};
