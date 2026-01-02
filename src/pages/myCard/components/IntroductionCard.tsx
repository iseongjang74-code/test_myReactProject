
import React from 'react';
import { IntroductionCardProps } from '../../../../types';

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const QuoteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
  </svg>
);

const IntroductionCard: React.FC<IntroductionCardProps> = ({ name, likes, motto, imageUrl }) => {
  return (
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl transform transition-all hover:scale-105 duration-300 ease-in-out">
      <div className="p-8 text-center">
        <img
          className="w-32 h-32 rounded-full mx-auto shadow-lg border-4 border-slate-200"
          src={imageUrl}
          alt={`${name}의 프로필 사진`}
        />
        <h1 className="mt-6 text-3xl font-bold text-slate-800">{name}</h1>
        <hr className="my-6 border-t border-slate-200" />

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-700 flex items-center justify-center gap-2">
            <HeartIcon className="w-6 h-6 text-red-500" />
            좋아하는 것
          </h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {likes.map((like, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {like}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-700 flex items-center justify-center gap-2">
            <QuoteIcon className="w-6 h-6 text-green-500" />
            좌우명
          </h2>
          <blockquote className="mt-4 text-slate-600 italic text-md leading-relaxed">
            "{motto}"
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default IntroductionCard;
