import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WebsiteCategory } from '../types';

interface HeaderProps {
    activeCategory: 'All' | WebsiteCategory;
    onCategoryChange: (category: 'All' | WebsiteCategory) => void;
}

const Header: React.FC<HeaderProps> = ({ activeCategory, onCategoryChange }) => {
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

    const navItems: ('All' | WebsiteCategory)[] = ['All', 'Game', 'MBTI'];
    const navItemTranslations: Record<'All' | WebsiteCategory, string> = {
        All: '전체',
        Game: '게임',
        MBTI: 'MBTI'
    };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">SiteBuilder</span>
                <Link to="/" className="ml-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  홈으로
                </Link>
            </div>
            <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
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
        <nav className="flex border-b border-slate-200 dark:border-slate-700">
            {navItems.map(item => (
                <button
                    key={item}
                    onClick={() => onCategoryChange(item)}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        activeCategory === item
                        ? 'border-b-2 border-sky-500 text-sky-600 dark:text-sky-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    {navItemTranslations[item]}
                </button>
            ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
