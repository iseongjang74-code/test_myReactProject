
import React, { useState, useEffect, useRef } from 'react';
import { AppState, GameMode, FocusStats, GameAssets, Marker } from '../../../types';
import Header from './components/Header';
import { audioService } from './services/audioService';
import { generateSpotTheDifference } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.HOME);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [assets, setAssets] = useState<GameAssets | null>(null);
  const [foundMarkers, setFoundMarkers] = useState<Marker[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [lastReport, setLastReport] = useState<FocusStats | null>(null);
  const [history, setHistory] = useState<FocusStats[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (state === AppState.GAME) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  const startAiGame = async (customPrompt?: string) => {
    const prompt = customPrompt || aiPrompt;
    if (!prompt) return;
    setLoading(true);
    audioService.playClick();
    try {
      const data = await generateSpotTheDifference(prompt, difficulty);
      setAssets(data);
      setStartTime(Date.now());
      setFoundMarkers([]);
      setClickCount(0);
      setState(AppState.GAME);
    } catch (err) {
      console.error(err);
      alert("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleLevelSelect = (level: number) => {
    setMode(GameMode.CLASSIC);
    const classicPrompt = `Classic Game Level ${level}: Very detailed scene of ${level % 2 === 0 ? 'a busy harbor' : 'a quiet museum exhibit'}`;
    setDifficulty(level > 7 ? 'hard' : level > 3 ? 'medium' : 'easy');
    startAiGame(classicPrompt);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setClickCount(prev => prev + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const totalRequired = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;

    if (foundMarkers.length < totalRequired) {
      const newMarker: Marker = { x, y, id: Date.now() };
      setFoundMarkers(prev => [...prev, newMarker]);
      audioService.playSuccess();
      
      if (foundMarkers.length + 1 === totalRequired) {
        setTimeout(() => finishGame(true, foundMarkers.length + 1, totalRequired), 1000);
      }
    }
  };

  const finishGame = (success: boolean, found: number, total: number) => {
    const stats: FocusStats = {
      mode: mode || GameMode.CLASSIC,
      startTime,
      endTime: Date.now(),
      foundCount: found,
      totalRequired: total,
      success,
      accuracy: Math.round((found / (clickCount || 1)) * 100)
    };
    setHistory(prev => [stats, ...prev]);
    setLastReport(stats);
    setState(AppState.REPORT);
    
    const feedback = success 
      ? `모든 차이를 찾아냈습니다! ${elapsedTime}초가 걸렸네요. 당신의 관찰력이 훌륭합니다.`
      : `수고하셨습니다. 다음 훈련에서는 더 높은 성과를 기대할게요.`;
    audioService.speak(feedback);
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 space-y-4">
        <div className="inline-block px-4 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-bold mb-4 tracking-wider uppercase">Focus Training Engine</div>
        <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent pb-2">
          틀(렸)니 맞(췄)니
        </h2>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          숏폼에 조각난 집중력을 회복하는 시간.<br/>
          AI가 생성한 미세한 차이를 발견하며 관찰 근육을 단련하세요.
        </p>
      </div>
      <button 
        onClick={() => { audioService.playClick(); setState(AppState.MODE_SELECT); }}
        className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl text-xl shadow-2xl shadow-emerald-500/40 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
      >
        훈련 시작하기 <span>→</span>
      </button>
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        {[
          { icon: '🎯', title: '능동적 관찰', desc: '수동적으로 시청하지 않고, 의도적으로 대상을 탐구합니다.' },
          { icon: '🧠', title: '두뇌 예열', desc: '중요한 작업을 시작하기 전, 전두엽의 회로를 정렬합니다.' },
          { icon: '✨', title: '맞춤형 AI', desc: '당신의 관심사를 반영한 고유한 이미지를 즉석에서 생성합니다.' }
        ].map((item, i) => (
          <div key={i} className="glass p-8 rounded-3xl text-left border-b-4 border-emerald-500 hover:translate-y-[-4px] transition-transform">
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="font-bold text-xl mb-3 text-white">{item.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModeSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold mb-12">어떤 코스로 훈련할까요?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div 
          onClick={() => { setMode(GameMode.CLASSIC); setState(AppState.CLASSIC_LEVELS); audioService.playClick(); }}
          className="glass p-10 rounded-3xl cursor-pointer hover:bg-slate-800/50 hover:border-emerald-500 transition-all group"
        >
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🏔️</div>
          <h3 className="text-2xl font-bold mb-3">클래식 코스</h3>
          <p className="text-slate-400 leading-relaxed">준비된 10개의 정교한 단계를 통해 기초적인 관찰 근육을 기릅니다.</p>
        </div>
        <div 
          onClick={() => { setMode(GameMode.AI_CUSTOM); setState(AppState.AI_CUSTOM_INPUT); audioService.playClick(); }}
          className="glass p-10 rounded-3xl cursor-pointer hover:bg-slate-800/50 hover:border-cyan-500 transition-all group"
        >
          <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🤖</div>
          <h3 className="text-2xl font-bold mb-3">AI 맞춤 코스</h3>
          <p className="text-slate-400 leading-relaxed">관심 분야의 키워드를 입력하여 즉석에서 생성된 맞춤형 문제에 도전합니다.</p>
        </div>
      </div>
      <button onClick={() => setState(AppState.HOME)} className="mt-12 text-slate-500 hover:text-white transition-colors">← 홈으로 가기</button>
    </div>
  );

  const renderClassicLevels = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in zoom-in-95 duration-500">
      <h2 className="text-3xl font-bold mb-10">단계별 훈련</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full max-w-4xl">
        {Array.from({ length: 10 }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleLevelSelect(i + 1)}
            className="glass aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-emerald-500 hover:text-slate-900 transition-all font-bold group shadow-lg"
          >
            <span className="text-xs opacity-60 font-black">LV.</span>
            <span className="text-4xl">{i + 1}</span>
          </button>
        ))}
      </div>
      <button onClick={() => setState(AppState.MODE_SELECT)} className="mt-12 text-slate-500 hover:text-white transition-colors">← 코스 선택으로</button>
    </div>
  );

  const renderAiInput = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 max-w-2xl mx-auto w-full animate-in fade-in duration-700">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-4">훈련 키워드를 정하세요</h2>
        <p className="text-slate-400 leading-relaxed">당신의 전공, 관심사, 혹은 상상하는 장면을 묘사해보세요.<br/>AI가 그 장면에 미세한 차이를 숨겨둘 것입니다.</p>
      </div>
      
      <div className="w-full space-y-8 glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 ml-2 uppercase tracking-widest">Training Prompt</label>
          <input 
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="예: 복잡한 회로 기판, 고풍스러운 서재, 복잡한 코드 화면..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 ml-2 uppercase tracking-widest">Difficulty</label>
          <div className="flex gap-4">
            {(['easy', 'medium', 'hard'] as const).map((lv) => (
              <button
                key={lv}
                onClick={() => setDifficulty(lv)}
                className={`flex-1 py-4 rounded-2xl font-bold transition-all border ${difficulty === lv ? 'bg-cyan-500 text-slate-900 border-cyan-400 shadow-xl' : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500'}`}
              >
                {lv === 'easy' ? '쉬움(3)' : lv === 'medium' ? '보통(5)' : '어려움(8)'}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => startAiGame()}
          disabled={!aiPrompt || loading}
          className="w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-2xl text-xl disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95 transition-all shadow-xl shadow-blue-600/30"
        >
          {loading ? 'AI 가 세계를 설계 중...' : '훈련 환경 생성 및 시작'}
        </button>
      </div>
      <button onClick={() => setState(AppState.MODE_SELECT)} className="mt-8 text-slate-500 hover:text-white transition-colors">← 뒤로 가기</button>
    </div>
  );

  const renderGame = () => {
    if (!assets) return null;
    const total = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;

    return (
      <div className="flex flex-col items-center pt-28 pb-12 px-6 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 mb-10 glass p-6 rounded-3xl border-b-4 border-emerald-500 shadow-2xl">
          <div className="flex items-center gap-8">
            <div className="text-center bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/5">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Duration</div>
              <div className="text-2xl font-mono font-bold text-white">{elapsedTime}s</div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-black text-slate-400 uppercase">Progress</span>
                <span className="text-xl font-bold text-emerald-400">{foundMarkers.length} / {total}</span>
              </div>
              <div className="w-full h-3 bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${(foundMarkers.length / total) * 100}%` }} 
                />
              </div>
            </div>
          </div>
          <div className="text-slate-400 text-sm font-medium animate-pulse px-6 py-3 bg-slate-900/50 rounded-full border border-white/5">
            우측 이미지의 다른 부분을 찾아 터치하세요!
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full relative">
          <div className="relative group rounded-[2.5rem] overflow-hidden border-2 border-white/5 shadow-2xl">
            <img src={assets.originalImage} className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-1000 group-hover:scale-105" alt="Original" />
            <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Reference View</div>
            {foundMarkers.map(m => (
              <div 
                key={`orig-${m.id}`}
                className="absolute w-14 h-14 border-4 border-emerald-400/40 rounded-full -translate-x-1/2 -translate-y-1/2 animate-in zoom-in duration-300"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              />
            ))}
          </div>

          <div 
            className="relative rounded-[2.5rem] overflow-hidden border-4 border-emerald-500/20 shadow-2xl cursor-crosshair group active:scale-[0.99] transition-transform bg-slate-900"
            onClick={handleImageClick}
          >
            <img src={assets.modifiedImage} className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-1000 group-hover:scale-105" alt="Target" />
            <div className="absolute top-6 left-6 px-4 py-2 bg-emerald-500/60 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-400/20 shadow-lg">Target View</div>
            
            {foundMarkers.map(m => (
              <div 
                key={`target-${m.id}`}
                className="absolute w-14 h-14 border-4 border-emerald-400 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-in zoom-in duration-300 shadow-[0_0_20px_rgba(52,211,153,0.6)]"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                <div className="w-3 h-3 bg-white rounded-full animate-ping" />
              </div>
            ))}
            
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="absolute inset-0 border-[30px] border-emerald-500/5" />
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => finishGame(false, foundMarkers.length, total)}
          className="mt-12 px-10 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest"
        >
          훈련 중단하기
        </button>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="flex flex-col items-center pt-28 pb-12 px-6 w-full max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-700">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black mb-4">나의 훈련 기록</h2>
        <p className="text-slate-400">당신의 집중력이 어떻게 변하고 있는지 확인하세요.</p>
      </div>
      
      {history.length === 0 ? (
        <div className="glass p-12 rounded-[2rem] text-center w-full">
          <p className="text-slate-500 text-lg">아직 기록된 훈련이 없습니다. 첫 훈련을 시작해보세요!</p>
          <button onClick={() => setState(AppState.MODE_SELECT)} className="mt-6 px-8 py-3 bg-emerald-500 text-slate-900 font-bold rounded-xl hover:bg-emerald-400 transition-all">훈련하러 가기</button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {history.map((h, i) => (
            <div key={i} className="glass p-6 rounded-2xl border-l-4 border-emerald-500 flex justify-between items-center group hover:bg-slate-800/50 transition-all">
              <div>
                <div className="text-xs font-black text-slate-500 uppercase mb-1">{h.mode === GameMode.CLASSIC ? 'Classic Mode' : 'AI Custom Mode'}</div>
                <div className="text-xl font-bold text-white">{new Date(h.startTime).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className="text-right flex items-center gap-6">
                <div className="hidden md:block">
                  <div className="text-[10px] font-black text-slate-500 uppercase">Accuracy</div>
                  <div className="text-lg font-bold text-emerald-400">{h.accuracy}%</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase">Found</div>
                  <div className="text-lg font-bold text-cyan-400">{h.foundCount} / {h.totalRequired}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setState(AppState.HOME)} className="mt-12 text-slate-500 hover:text-white transition-colors">← 홈으로</button>
    </div>
  );

  const renderGuide = () => (
    <div className="flex flex-col items-center pt-28 pb-12 px-6 w-full max-w-3xl mx-auto animate-in fade-in duration-700">
      <div className="glass p-12 rounded-[3rem] w-full space-y-10 border-t-8 border-cyan-500 shadow-2xl">
        <div className="text-center">
          <h2 className="text-4xl font-black mb-4">훈련 가이드</h2>
          <p className="text-slate-400 leading-relaxed italic">"관찰은 천재성의 첫 번째 원칙이다."</p>
        </div>
        
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">1</span>
              왜 이 훈련이 필요한가요?
            </h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              숏폼 콘텐츠는 뇌의 '수동적 주의력'만을 자극하여 깊은 사고와 장기적인 몰입을 방해합니다. 틀린그림찾기는 당신의 전두엽을 사용하여 의도적으로 대상을 탐색하게 함으로써, 부서진 집중력을 다시 결합하는 훌륭한 두뇌 운동입니다.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">2</span>
              어떻게 훈련하나요?
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">•</span>
                <span><strong>이미지 훑기:</strong> 시선을 지그재그로 움직이며 전체적인 구성을 먼저 파악하세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">•</span>
                <span><strong>대조하기:</strong> 왼쪽의 원본(Ref)과 오른쪽의 목표(Target)를 번갈아 보며 세부 사항을 대조합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">•</span>
                <span><strong>터치하기:</strong> 우측 이미지에서 차이점을 발견하면 즉시 터치하세요.</span>
              </li>
            </ul>
          </section>
        </div>

        <button 
          onClick={() => { audioService.playClick(); setState(AppState.MODE_SELECT); }}
          className="w-full py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-black rounded-2xl text-lg hover:shadow-xl hover:shadow-cyan-500/20 transition-all"
        >
          지금 바로 시작하기
        </button>
      </div>
      <button onClick={() => setState(AppState.HOME)} className="mt-12 text-slate-500 hover:text-white transition-colors">← 홈으로</button>
    </div>
  );

  const renderReport = () => {
    if (!lastReport) return null;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 w-full animate-in zoom-in-95 duration-700">
        <div className="glass max-w-xl w-full p-12 rounded-[3rem] text-center space-y-10 border-t-8 border-emerald-500 shadow-2xl">
          <div className="space-y-2">
            <div className="text-emerald-400 font-black text-xs tracking-widest uppercase tracking-widest">Training Summary</div>
            <h2 className="text-4xl font-black">훈련 성공!</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
              <div className="text-slate-500 text-[10px] mb-1 uppercase font-black">집중 시간</div>
              <div className="text-3xl font-bold">{elapsedTime}s</div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
              <div className="text-slate-500 text-[10px] mb-1 uppercase font-black">정확도</div>
              <div className="text-3xl font-bold text-emerald-400">{lastReport.accuracy}%</div>
            </div>
          </div>

          <div className="text-xl italic font-medium text-emerald-300 leading-relaxed bg-emerald-500/5 p-8 rounded-3xl">
            {lastReport.success ? "완벽합니다! 당신의 뇌가 새로운 몰입의 경로를 만들었습니다." : "포기하지 마세요. 과정 자체가 뇌의 가소성을 높여줍니다."}
          </div>

          {assets && (
            <div className="text-left bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
              <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-widest">AI가 숨겨둔 정답 분석</h4>
              <ul className="space-y-3 text-sm text-slate-300">
                {assets.differencesDescription.map((diff, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="text-emerald-500 font-bold">{i+1}.</span>
                    <span className="leading-tight">{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => { audioService.playClick(); setState(AppState.MODE_SELECT); }}
              className="w-full py-5 bg-emerald-500 text-slate-900 font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/30"
            >
              다른 코스 도전하기
            </button>
            <button 
              onClick={() => { audioService.playClick(); setState(AppState.HOME); }}
              className="w-full py-5 bg-slate-900 text-slate-400 font-black rounded-2xl hover:text-white transition-all border border-white/5"
            >
              메인 화면으로
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (state) {
      case AppState.HOME: return renderHome();
      case AppState.MODE_SELECT: return renderModeSelect();
      case AppState.CLASSIC_LEVELS: return renderClassicLevels();
      case AppState.AI_CUSTOM_INPUT: return renderAiInput();
      case AppState.GAME: return renderGame();
      case AppState.REPORT: return renderReport();
      case AppState.HISTORY: return renderHistory();
      case AppState.GUIDE: return renderGuide();
      default: return renderHome();
    }
  };

  return (
    <div className="min-h-screen pb-12 overflow-x-hidden selection:bg-emerald-500 selection:text-slate-900">
      <Header 
        onHome={() => { audioService.playClick(); setState(AppState.HOME); }} 
        onHistory={() => { audioService.playClick(); setState(AppState.HISTORY); }}
        onGuide={() => { audioService.playClick(); setState(AppState.GUIDE); }}
      />
      <main className="container mx-auto">
        {renderContent()}
      </main>
      
      {loading && (
        <div className="fixed inset-0 z-[100] glass flex flex-col items-center justify-center gap-10 animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-emerald-500/20 rounded-full" />
            <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-3xl font-black text-white">AI가 정밀한 세상을 생성 중입니다</h3>
            <p className="text-slate-400 animate-pulse-soft italic max-w-sm px-6">
              "알고리즘이 지배하는 뇌를 당신의 의지로 탈환하는 과정입니다. 잠시만 기다려주세요."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
