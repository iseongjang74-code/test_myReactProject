
import React, { useState, useEffect } from 'react';
import { UserLevel, VocabularyWord } from '../../../types';
import { fetchRecommendedWords } from './services/geminiService';
import WordCard from './components/WordCard';
import FullscreenContainer from '../../../components/FullscreenContainer';

const App: React.FC = () => {
  const [level, setLevel] = useState<UserLevel>(UserLevel.INTERMEDIATE);
  const [interests, setInterests] = useState<string[]>(['Daily Life', 'Travel']);
  const [interestInput, setInterestInput] = useState('');
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const recommendedWords = await fetchRecommendedWords(level, interests);
      setWords(recommendedWords);
    } catch (err: any) {
      setError(err?.message ? `Error: ${err.message}` : 'Failed to fetch words. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, [level]);

  const addInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  return (
    <FullscreenContainer className="min-h-screen pb-20 px-4 pt-12 md:pt-20 max-w-6xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          VocabVantage <span className="gradient-text">AI</span>
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Personalized English vocabulary coaching powered by Gemini. Select your level and interests to get started.
        </p>
      </header>

      <section className="bg-white rounded-3xl shadow-xl shadow-indigo-100 p-6 md:p-8 mb-10 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Level Selector */}
          <div className="w-full md:w-1/2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Your Proficiency Level</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.values(UserLevel).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    level === l
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Interests Selector */}
          <div className="w-full md:w-1/2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Focus Interests</h3>
            <form onSubmit={addInterest} className="flex gap-2 mb-4">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="e.g. Finance, Nature, Coding..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="submit"
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-200 transition-colors"
              >
                Add
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, i) => (
                <span
                  key={i}
                  className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 group"
                >
                  {interest}
                  <button 
                    onClick={() => removeInterest(i)}
                    className="hover:text-indigo-800 font-bold opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={loadWords}
            disabled={isLoading}
            className="group flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Updating Vocabulary...
              </>
            ) : (
              <>
                Generate New Recommendations
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-8 border border-red-100">
          {error}
        </div>
      )}

      {isLoading && !words.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-slate-200 h-64 rounded-3xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {words.map((word, index) => (
            <WordCard key={`${word.word}-${index}`} word={word} />
          ))}
        </div>
      )}
    </FullscreenContainer>
  );
};

export default App;
