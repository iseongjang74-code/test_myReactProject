import React, { useState, useEffect } from 'react';
import { WebsiteCategory } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
    activeCategory: 'All' | WebsiteCategory;
    onCategoryChange: (category: 'All' | WebsiteCategory) => void;
}

const Header: React.FC<HeaderProps> = ({ activeCategory, onCategoryChange }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    // 뒤로가기/홈 버튼 로직
    const hasHistory = typeof window !== 'undefined' && window.history.length > 1;
    const isAtRootNoHistory = typeof window !== 'undefined' && location.pathname === '/' && !hasHistory;

    const navItems: ('All' | WebsiteCategory)[] = ['All', 'Game', 'MBTI'];
    const navItemTranslations: Record<'All' | WebsiteCategory, string> = {
        All: '전체',
        Game: '게임',
        MBTI: 'MBTI'
    };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="py-4 flex justify-between items-center" role="banner">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">SiteBuilder</span>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="테마 전환">
                    {isDarkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>

        {/* 카테고리 네비게이션을 시맨틱하게 구분 */}
        <nav aria-label="카테고리 네비게이션" className="flex items-center border-b border-slate-200 dark:border-slate-700">
            {/* 네비게이션 내 뒤로가기/홈 버튼 (항상 표시) */}
            <button
                onClick={() => isAtRootNoHistory ? navigate('/') : navigate(-1)}
                aria-label={isAtRootNoHistory ? '홈으로 이동' : '뒤로가기'}
                title={isAtRootNoHistory ? '홈으로 이동' : '뒤로가기'}
                className="p-2 mx-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                {isAtRootNoHistory ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.5L12 4l9 5.5V21a1 1 0 0 1-1 1h-6v-6H10v6H4a1 1 0 0 1-1-1V9.5z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                )}
            </button>

            <div className="flex-1 flex">
                {navItems.map(item => (
                    <button
                        key={item}
                        onClick={() => onCategoryChange(item)}
                        aria-current={activeCategory === item ? 'page' : undefined}
                        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                            activeCategory === item
                            ? 'border-b-2 border-sky-500 text-sky-600 dark:text-sky-400'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {navItemTranslations[item]}
                    </button>
                ))}
            </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
