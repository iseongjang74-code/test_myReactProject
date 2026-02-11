import React, { useState, useRef, useEffect } from 'react';

interface FullscreenContainerProps {
  children: React.ReactNode;
  className?: string;
}

const FullscreenContainer: React.FC<FullscreenContainerProps> = ({ children, className = '' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // 전체 화면 진입
        if (containerRef.current) {
          await containerRef.current.requestFullscreen().catch(err => {
            console.error(`전체 화면 오류: ${err.message}`);
          });
          setIsFullscreen(true);
          // 스크롤 방지
          document.body.style.overflow = 'hidden';
        }
      } else {
        // 전체 화면 해제
        await document.exitFullscreen();
        setIsFullscreen(false);
        // 스크롤 복원
        document.body.style.overflow = '';
      }
    } catch (err) {
      console.error('Fullscreen 전환 오류:', err);
    }
  };

  // Fullscreen 상태 변화 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        backgroundColor: isFullscreen ? '#000' : 'transparent',
      }}
    >
      {/* Fullscreen 버튼 */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-50 p-3 rounded-2xl bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all duration-200"
        title={isFullscreen ? '전체 화면 해제' : '전체 화면'}
        aria-label={isFullscreen ? '전체 화면 해제' : '전체 화면'}
      >
        {isFullscreen ? (
          // 해제 아이콘
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // 전체 화면 아이콘
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4m-4 0l5 5m11-5v4m0 0h-4m4 0l-5 5M4 20v-4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5"
            />
          </svg>
        )}
      </button>

      {/* 콘텐츠 */}
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default FullscreenContainer;
