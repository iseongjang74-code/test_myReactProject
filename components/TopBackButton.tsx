import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TopBackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack = typeof window !== 'undefined' && (window.history.length > 1 || location.pathname !== '/');

  if (!canGoBack) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="뒤로가기"
      title="뒤로가기"
      className="fixed top-4 left-4 z-50 p-2 bg-white/90 dark:bg-slate-800/90 rounded-md shadow-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

export default TopBackButton;
