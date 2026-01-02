
import React, { useState } from 'react';
import { SocialFriend, AIGeneratedContent } from '../../../../types';
import { generateFriendInsights } from '../services/geminiService';

interface FriendCardProps {
  friend: SocialFriend;
  onDelete: (id: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({ friend, onDelete }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiContent, setAiContent] = useState<AIGeneratedContent | null>(null);

  const handleAIAction = async () => {
    setIsGenerating(true);
    try {
      const result = await generateFriendInsights(friend);
      setAiContent(result);
    } catch (error) {
      console.error('AI Insight Error:', error);
      alert('AI 추천 정보를 가져오는 데 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getInitials = (name: string) => name.charAt(0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md hover:scale-[1.01]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
            {getInitials(friend.name)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{friend.name}</h3>
            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-600">
              {friend.relationship}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(friend.id)}
          className="text-gray-300 hover:text-red-500 transition-colors"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>

      {friend.birthday && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <i className="fas fa-birthday-cake mr-2 text-pink-400"></i>
          {friend.birthday}
        </div>
      )}

      {friend.notes && (
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg line-clamp-2 mb-4">
          {friend.notes}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-gray-50">
        {!aiContent ? (
          <button
            onClick={handleAIAction}
            disabled={isGenerating}
            className={`flex items-center justify-center w-full py-2 rounded-lg text-sm font-medium transition-all ${
              isGenerating
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600'
            }`}
          >
            {isGenerating ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                AI가 생각하는 중...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i>
                AI 별명 & 메시지 추천
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div className="flex flex-wrap gap-2">
              {aiContent.nicknames.map((nick, idx) => (
                <span key={idx} className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full border border-amber-100">
                  ✨ {nick}
                </span>
              ))}
            </div>
            <p className="text-xs text-indigo-700 italic bg-indigo-50 p-2 rounded border border-indigo-100">
              "{aiContent.message}"
            </p>
            <button 
              onClick={() => setAiContent(null)}
              className="text-[10px] text-gray-400 hover:underline"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendCard;
