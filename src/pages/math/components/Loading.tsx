
import React from 'react';

const Loading: React.FC = () => {
  const [message, setMessage] = React.useState("암호화 코어 초기화 중...");
  
  const messages = [
    "논리적 패턴 환경 스캔 중...",
    "체임버 잠금 장치 보안 확인 중...",
    "수학적 난이도 매트릭스 보정 중...",
    "퍼즐 엔진과 신경망 연결 수립 중...",
    "수열 내 비정상 패턴 감지 중...",
    "보안 프로토콜 우회 시도 중...",
    "다음 구역의 코드 해독 중..."
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm p-6 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-4 border-b-4 border-indigo-400 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-brain text-cyan-400 text-2xl animate-pulse"></i>
        </div>
      </div>
      <h2 className="text-xl font-bold text-white mb-2 tracking-tight">도전 과제 생성 중</h2>
      <p className="text-slate-400 text-xs font-mono max-w-xs h-10">{message}</p>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;
