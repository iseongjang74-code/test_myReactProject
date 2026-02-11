import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { WebsiteCategory } from '../../types';

const Layout = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | WebsiteCategory>('All');
  const [isGameOpen, setIsGameOpen] = useState(false);

  // 게임 페이지 열림/닫힘 감지
  useEffect(() => {
    const handleRouteChange = () => {
      // 현재 경로 확인
      const isGamePage = 
        window.location.pathname.includes('/gacha') ||
        window.location.pathname.includes('/click_war') ||
        window.location.pathname.includes('/snake_game') ||
        window.location.pathname.includes('/last_night') ||
        window.location.pathname.includes('/mordern') ||
        window.location.pathname.includes('/word') ||
        window.location.pathname.includes('/word2') ||
        window.location.pathname.includes('/friend') ||
        window.location.pathname.includes('/math') ||
        window.location.pathname.includes('/AI_voca') ||
        window.location.pathname.includes('/myCard') ||
        window.location.pathname.includes('/DilemmaSimulator');
      
      setIsGameOpen(isGamePage);
      
      // 게임 페이지일 때는 스크롤 방지
      if (isGamePage) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange(); // 초기 로드 시 확인

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      className="flex flex-col min-h-screen transition-colors duration-300"
      style={{
        position: isGameOpen ? 'fixed' : 'relative',
        width: '100%',
        height: isGameOpen ? '100vh' : 'auto',
        overflow: isGameOpen ? 'hidden' : 'auto',
      }}
    >
      {!isGameOpen && <Header 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />}

      <main className="flex-grow" style={{ width: '100%' }}>
        <Outlet context={{ activeCategory, setActiveCategory }} />
      </main>

      {!isGameOpen && <Footer />}
    </div>
  );
};

export default Layout;