import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 shadow-inner mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-slate-500 dark:text-slate-400">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} 기로뇽뇽. All rights reserved.
        </p>
        <p className="text-xs mt-2">
          경기도 성남시 분당구 대장동 풍경채 어바니티 7단지
        </p>
      </div>
    </footer>
  );
};

export default Footer;
