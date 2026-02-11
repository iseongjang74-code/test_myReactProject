import React, { useState } from 'react';
import { Word, WordSet, AppMode } from '../../../types';
import { UploadView } from './components/UploadView';
import { StudyMode } from './components/StudyMode';
import { RecallTest } from './components/RecallTest';
import { audioService } from './services/audioService';
import { Trophy, Repeat, Sparkles, Home, Flame } from 'lucide-react';
import FullscreenContainer from '../../../components/FullscreenContainer';

const CHUNK_SIZE = 10;

const App: React.FC = () => {
  const [wordSets, setWordSets] = useState<WordSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [testResult, setTestResult] = useState<{ correct: Word[]; wrong: Word[] } | null>(null);
  
  // Feature 6: Global Wrong Answer Box
  const [globalWrongWords, setGlobalWrongWords] = useState<Word[]>([]);
  // Feature 5: Bidirectional Toggle State
  const [isReverseMode, setIsReverseMode] = useState(false);

  const handleWordsLoaded = (words: Word[]) => {
    const sets: WordSet[] = [];
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      sets.push({
        id: i,
        words: words.slice(i, i + CHUNK_SIZE),
        isUnlocked: i === 0, 
      });
    }
    setWordSets(sets);
    setCurrentSetIndex(0);
    setMode(AppMode.STUDY);
  };

  const handleStartWrongReview = () => {
    if (globalWrongWords.length === 0) return;
    // Create a special "Wrong Review" set
    const wrongSet: WordSet = {
        id: 999, // Special ID
        words: [...globalWrongWords], // Copy
        isUnlocked: true
    };
    setWordSets([wrongSet]);
    setCurrentSetIndex(0);
    setMode(AppMode.WRONG_REVIEW);
  };

  const handleStudyComplete = () => {
    setMode(AppMode.TEST);
  };

  const handleTestFinish = (results: { correct: Word[]; wrong: Word[] }) => {
    setTestResult(results);
    
    // Feature 6: Add wrong words to global box (deduplicated)
    setGlobalWrongWords(prev => {
      const combined = [...prev, ...results.wrong];
      // Remove duplicates by ID
      return Array.from(new Map(combined.map(w => [w.id, w])).values());
    });

    // If current mode was WRONG_REVIEW and we got them correct, remove from global box
    if (mode === AppMode.WRONG_REVIEW || mode === AppMode.TEST) { 
       // If we are reviewing wrong words, successful ones should be removed from the "Prison"
       if (results.correct.length > 0) {
           setGlobalWrongWords(prev => prev.filter(w => !results.correct.some(cw => cw.id === w.id)));
       }
    }

    audioService.playSuccess();
    setMode(AppMode.RESULT);
  };

  const handleNextSet = () => {
    const nextIndex = currentSetIndex + 1;
    if (nextIndex < wordSets.length) {
      const newSets = [...wordSets];
      newSets[nextIndex].isUnlocked = true;
      setWordSets(newSets);
      
      setCurrentSetIndex(nextIndex);
      setTestResult(null);
      setMode(AppMode.STUDY);
    } else {
      alert("모든 단어 학습을 완료했습니다! 훌륭해요!");
      setMode(AppMode.HOME);
    }
  };

  const handleRetryWrong = () => {
    if (testResult && testResult.wrong.length > 0) {
        // Immediate retry of just these wrong words
        const retrySet: WordSet = {
            id: currentSet?.id || 0, // Keep same numbering
            words: testResult.wrong,
            isUnlocked: true
        };
        setWordSets([retrySet]);
        setCurrentSetIndex(0);
        audioService.playClick();
        setMode(AppMode.STUDY);
    }
  };

  const goHome = () => {
      if (confirm("홈으로 돌아가시겠습니까? 현재 진행 상황이 초기화될 수 있습니다.")) {
          setMode(AppMode.HOME);
      }
  };

  // Determine current words to show
  const currentSet = wordSets[currentSetIndex];
  // Calculate start index for display (1-based)
  // If normal set, id is the offset (0, 10, 20). So start is id + 1.
  // If wrong review (id 999), we can just start at 1.
  const displayStartIndex = currentSet?.id === 999 ? 1 : (currentSet?.id || 0) + 1;

  return (
    <FullscreenContainer>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="w-full max-w-lg h-screen md:h-[850px] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Top Bar */}
        {mode !== AppMode.HOME && (
          <div className="bg-white/80 backdrop-blur-md z-10 p-4 flex justify-between items-center border-b border-slate-100">
            <button onClick={goHome} className="p-2 text-slate-400 hover:text-slate-600">
                <Home size={20} />
            </button>
            <span className="font-bold text-indigo-600 flex items-center gap-1">
              {mode === AppMode.WRONG_REVIEW ? <><Flame size={18} /> PRISON BREAK</> : <><Sparkles size={18} /> SET {currentSetIndex + 1}</>}
            </span>
            <div className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {mode === AppMode.STUDY || mode === AppMode.WRONG_REVIEW ? 'LEARNING' : mode === AppMode.TEST ? 'TESTING' : 'RESULT'}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {mode === AppMode.HOME && (
              <UploadView 
                onWordsLoaded={handleWordsLoaded} 
                onStartWrongReview={handleStartWrongReview}
                wrongWordsCount={globalWrongWords.length}
                isReverse={isReverseMode}
                onToggleReverse={() => setIsReverseMode(!isReverseMode)}
              />
          )}
          
          {(mode === AppMode.STUDY || mode === AppMode.WRONG_REVIEW) && currentSet && (
            <StudyMode 
              words={currentSet.words} 
              onComplete={handleStudyComplete} 
              isReverse={isReverseMode}
              startIndex={displayStartIndex}
            />
          )}

          {mode === AppMode.TEST && currentSet && (
            <RecallTest 
              words={currentSet.words} 
              onFinish={handleTestFinish} 
              isReverse={isReverseMode}
              startIndex={displayStartIndex}
            />
          )}

          {mode === AppMode.RESULT && testResult && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
              <div className="bg-yellow-100 p-6 rounded-full text-yellow-500 mb-6 animate-bounce">
                <Trophy size={64} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">학습 완료!</h2>
              <p className="text-slate-500 mb-8">
                {testResult.correct.length}개 기억함 / {testResult.wrong.length}개 놓침
              </p>
              
              <div className="w-full space-y-3">
                {testResult.wrong.length > 0 ? (
                  <button 
                    onClick={handleRetryWrong}
                    className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <Repeat size={20} /> 틀린 단어 바로 재시험
                  </button>
                ) : (
                  <div className="text-indigo-600 font-bold py-2">완벽해요! 스파크가 튀었네요! 🎉</div>
                )}

                {/* Only show Next Set if we have more sets and aren't in a special mode */}
                {mode !== AppMode.WRONG_REVIEW && currentSetIndex < wordSets.length - 1 && (
                    <button 
                      onClick={handleNextSet}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-800 transition"
                    >
                      다음 세트 열기 ({currentSetIndex + 2} SET)
                    </button>
                )}

                <button 
                    onClick={() => setMode(AppMode.HOME)}
                    className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition"
                >
                    홈으로 돌아가기
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Deco */}
        </div>
      </div>
    </FullscreenContainer>
  );
};

export default App;