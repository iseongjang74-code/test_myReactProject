import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PuzzleCard from './components/PuzzleCard';
import Loading from './components/Loading';
import StartScreen from './components/StartScreen';
import Ranking from './components/Ranking';
import { Difficulty, Puzzle, GameState, ScoreEntry } from '../../../types';
import { generatePuzzle } from './services/geminiService';
import FullscreenContainer from '../../../components/FullscreenContainer';

const RANKING_KEY = 'math_puzzle_rankings';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    stage: 1,
    difficulty: Difficulty.EASY,
    score: 0,
    lives: 3,
    status: 'MENU',
  });

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [rankings, setRankings] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(RANKING_KEY);
    if (saved) {
      setRankings(JSON.parse(saved));
    }
  }, []);

  const saveScore = (score: number, stage: number) => {
    const name = prompt('축하합니다! 이름을 입력하세요 (랭킹 등록):') || '익명의 에이전트';
    const newEntry: ScoreEntry = {
      name,
      score,
      stage,
      date: new Date().toISOString()
    };
    const updated = [...rankings, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setRankings(updated);
    localStorage.setItem(RANKING_KEY, JSON.stringify(updated));
  };

  const loadNewPuzzle = useCallback(async (currentDifficulty: Difficulty, currentStage: number) => {
    setIsLoading(true);
    setShowHint(false);
    setSelectedOption(null);
    setFeedback(null);
    
    try {
      const newPuzzle = await generatePuzzle(currentDifficulty, currentStage);
      setPuzzle(newPuzzle);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startGame = (difficulty: Difficulty) => {
    setState({
      stage: 1,
      difficulty,
      score: 0,
      lives: 3,
      status: 'PLAYING',
    });
    loadNewPuzzle(difficulty, 1);
  };

  const handleSelectOption = (option: string) => {
    if (feedback || !puzzle) return;
    
    setSelectedOption(option);
    
    if (option === puzzle.correctAnswer) {
      setFeedback({ type: 'success', message: '잠금 해제 성공. 다음 구역으로 이동합니다.' });
      setTimeout(() => {
        const nextStage = state.stage + 1;
        let nextDifficulty = state.difficulty;
        
        if (state.difficulty === Difficulty.EASY && nextStage > 5) nextDifficulty = Difficulty.MEDIUM;
        if (state.difficulty === Difficulty.MEDIUM && nextStage > 10) nextDifficulty = Difficulty.HARD;

        setState(prev => ({
          ...prev,
          stage: nextStage,
          difficulty: nextDifficulty,
          score: prev.score + (state.difficulty === Difficulty.EASY ? 100 : state.difficulty === Difficulty.MEDIUM ? 250 : 500)
        }));
        loadNewPuzzle(nextDifficulty, nextStage);
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: '해독 오류: 보안 프로토콜이 작동되었습니다.' });
      setState(prev => {
        const newLives = prev.lives - 1;
        if (newLives <= 0) {
          setTimeout(() => {
            saveScore(prev.score, prev.stage);
            setState(s => ({ ...s, status: 'GAME_OVER' }));
          }, 1500);
          return { ...prev, lives: 0 };
        }
        return { ...prev, lives: newLives };
      });
      
      setTimeout(() => {
        if (state.lives > 1) {
          setFeedback(null);
          setSelectedOption(null);
        }
      }, 1500);
    }
  };

  const resetToMenu = () => {
    setState(prev => ({ ...prev, status: 'MENU' }));
  };

  if (state.status === 'MENU') {
    return (
      <FullscreenContainer>
        <div className="min-h-screen pt-12 pb-12 px-4 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
          <StartScreen 
            onStart={startGame} 
            onShowRanking={() => setState(s => ({...s, status: 'RANKING'}))} 
          />
        </div>
      </FullscreenContainer>
    );
  }

  if (state.status === 'RANKING') {
    return (
      <FullscreenContainer>
        <div className="min-h-screen pt-12 pb-12 px-4 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
          <Ranking rankings={rankings} onBack={resetToMenu} />
        </div>
      </FullscreenContainer>
    );
  }

  if (state.status === 'GAME_OVER') {
    return (
      <FullscreenContainer>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
          <div className="glass p-10 rounded-3xl border border-rose-500/30 text-center max-w-sm w-full animate-slide-up shadow-2xl">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-skull-crossbones text-rose-500 text-3xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tighter">작전 실패</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              보안망을 뚫지 못했습니다.<br/>
              최종 스테이지: {state.stage}<br/>
              최종 점수: {state.score.toLocaleString()}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => startGame(state.difficulty)}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-rose-600/20 transform active:scale-95"
              >
                다시 시도
              </button>
              <button 
                onClick={resetToMenu}
                className="w-full glass text-slate-400 font-bold py-3 rounded-2xl hover:text-white transition-all"
              >
                메뉴로
              </button>
            </div>
          </div>
        </div>
      </FullscreenContainer>
    );
  }

  return (
    <FullscreenContainer>
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <Header 
          stage={state.stage} 
          difficulty={state.difficulty} 
          score={state.score} 
          lives={state.lives}
        />

        {isLoading && <Loading />}

        {!isLoading && puzzle && (
          <PuzzleCard 
            puzzle={puzzle} 
            onSelectOption={handleSelectOption}
            selectedOption={selectedOption}
            isLocked={!!feedback}
            showHint={showHint}
            onToggleHint={() => setShowHint(!showHint)}
          />
        )}

        {feedback && (
          <div className="fixed bottom-12 left-0 right-0 z-50 px-4 animate-bounce">
            <div className={`max-w-md mx-auto glass p-4 rounded-2xl text-center border-2 ${
              feedback.type === 'success' ? 'border-emerald-500 bg-emerald-500/20' : 'border-rose-500 bg-rose-500/20'
            }`}>
              <p className={`font-bold text-xs tracking-widest flex items-center justify-center gap-2 ${
                feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                <i className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                {feedback.message}
              </p>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 w-full h-1/4 pointer-events-none bg-gradient-to-t from-cyan-500/5 to-transparent z-0 opacity-50"></div>
      </div>
    </FullscreenContainer>
  );
};

export default App;
