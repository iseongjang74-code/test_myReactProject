import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { WebsiteCategory } from '../../types';

const Layout = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | WebsiteCategory>('All');

  return (
    <div className="flex flex-col min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Header 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="flex-grow">
        <Outlet context={{ activeCategory, setActiveCategory }} />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;