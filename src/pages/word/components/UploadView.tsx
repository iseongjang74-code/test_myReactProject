import React, { useState } from 'react';
import { Upload, Zap, Flame, ArrowRightLeft, FileText, Sparkles } from 'lucide-react';
import { Word } from '../../../../types';
import { audioService } from '../services/audioService';
import { generateSampleWords } from '../services/geminiService';
import { GoogleGenAI, Type } from "@google/genai";

interface Props {
  onWordsLoaded: (words: Word[]) => void;
  onStartWrongReview: () => void;
  wrongWordsCount: number;
  isReverse: boolean;
  onToggleReverse: () => void;
}

export const UploadView: React.FC<Props> = ({ 
  onWordsLoaded, 
  onStartWrongReview, 
  wrongWordsCount,
  isReverse,
  onToggleReverse
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");

  // Helper to get Gemini client for single word translation
  const getAIClient = () => {
     const apiKey = process.env.API_KEY;
     if (!apiKey) return null;
     return new GoogleGenAI({ apiKey });
  };

  const translateMissingDefinitions = async (rawWords: {term: string}[]) => {
      const ai = getAIClient();
      if (!ai) return rawWords.map(w => ({ ...w, definition: '???' }));

      const prompt = `Translate these English words to Korean definitions. Return JSON array of strings. Words: ${rawWords.map(w => w.term).join(', ')}`;
      
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        const definitions = JSON.parse(response.text || "[]");
        return rawWords.map((w, i) => ({ 
            term: w.term, 
            definition: definitions[i] || '뜻 검색 실패' 
        }));
      } catch (e) {
          console.error(e);
          return rawWords.map(w => ({ ...w, definition: '자동 번역 실패' }));
      }
  };

  const processText = async (text: string) => {
    const lines = text.split('\n');
    let processedWords: {term: string, definition?: string, mnemonic?: string, example?: string}[] = [];
    
    lines.forEach((line) => {
      let cleanLine = line.trim();
      if (!cleanLine) return;

      // 1. STRIP NUMBERING FIRST (Core Fix)
      // Removes "1.", "1)", "1 " at the start
      cleanLine = cleanLine.replace(/^\d+[\.\)\s]+\s*/, '');

      if (!cleanLine) return;
      
      // 2. Try Splitting
      let parts: string[] = [];
      
      // Check for explicit delimiters first (Quote aware)
      let inQuotes = false;
      let currentToken = '';
      let hasExplicitDelimiter = false;
      
      for (let i = 0; i < cleanLine.length; i++) {
          const char = cleanLine[i];
          if (char === '"') { inQuotes = !inQuotes; continue; }
          
          if (!inQuotes && (char === ',' || char === '\t' || char === '|' || (char === ':' && !currentToken.match(/^\d/)))) {
              parts.push(currentToken.trim());
              currentToken = '';
              hasExplicitDelimiter = true;
          } else if (!inQuotes && (char === '-' || char === '=') && parts.length === 0 && currentToken.length > 0) {
               parts.push(currentToken.trim());
               currentToken = '';
               hasExplicitDelimiter = true;
          } else {
              currentToken += char;
          }
      }
      parts.push(currentToken.trim());
      parts = parts.filter(p => p !== "");

      // 3. FALLBACK: Smart Space Splitter (English vs Korean)
      // If no comma/tab was found and we have just one long string like "apple 사과"
      if (!hasExplicitDelimiter && parts.length === 1) {
          const content = parts[0];
          // Regex looks for: [English/Symbols] [Space] [Korean Start]
          // Captures the split point where English ends and Korean begins
          const match = content.match(/^([a-zA-Z0-9\s\-\(\)\?]+)\s+([가-힣].*)$/);
          if (match) {
              parts = [match[1].trim(), match[2].trim()];
          }
      }

      if (parts.length === 0) return;

      const term = parts[0];
      // Skip if term became empty
      if (!term) return;

      if (parts.length >= 2) {
        processedWords.push({
            term: term,
            definition: parts[1],
            mnemonic: parts[2] || undefined,
            example: parts[3] || undefined
        });
      } else {
        // Single column case (just "apple")
        processedWords.push({ term: term });
      }
    });

    if (processedWords.length === 0) {
        audioService.playError();
        alert("유효한 단어를 찾지 못했습니다.");
        return;
    }

    // Check if we need to fetch definitions
    const needsTranslation = processedWords.filter(w => !w.definition);
    
    if (needsTranslation.length > 0 && needsTranslation.length === processedWords.length) {
        setIsLoading(true);
        try {
            const translated = await translateMissingDefinitions(needsTranslation as {term: string}[]);
            
            const finalWords: Word[] = translated.map((w, idx) => ({
                id: `uploaded-${idx}-${Date.now()}`,
                term: w.term,
                definition: w.definition || '???',
                status: 'new'
            }));
            
            audioService.playSuccess();
            onWordsLoaded(finalWords);
        } catch (e) {
            alert("단어 뜻을 가져오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    } else {
        // Standard mode
        const finalWords: Word[] = processedWords.map((w, idx) => ({
            id: `uploaded-${idx}-${Date.now()}`,
            term: w.term,
            definition: w.definition || '???',
            mnemonic: w.mnemonic,
            example: w.example,
            status: 'new'
        }));
        audioService.playSuccess();
        onWordsLoaded(finalWords);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleGenAI = async () => {
    setIsLoading(true);
    audioService.playClick();
    try {
      const words = await generateSampleWords();
      if (words.length > 0) {
        audioService.playSuccess();
        onWordsLoaded(words);
      }
    } catch (e) {
      audioService.playError();
      alert("AI 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tighter filter drop-shadow-sm">
          WORD SPARK
        </h1>
        <p className="text-slate-500 font-medium">뇌공학적 원리로 단어를 각인시키세요</p>
      </div>

      {/* Wrong Answer Box */}
      {wrongWordsCount > 0 && (
        <button 
          onClick={onStartWrongReview}
          className="w-full bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-100 p-5 rounded-2xl flex items-center justify-between hover:shadow-md hover:border-red-200 transition group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex items-center gap-4 z-10">
            <div className="bg-white p-3 rounded-full shadow-sm text-red-500 animate-pulse ring-2 ring-red-100">
              <Flame size={24} fill="currentColor" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800 text-lg">오답 감옥 (Prison)</h3>
              <p className="text-sm text-slate-500">
                <span className="font-bold text-red-600 text-lg">{wrongWordsCount}</span>개의 단어가 탈출을 기다립니다.
              </p>
            </div>
          </div>
          <div className="bg-white text-red-500 px-5 py-2 rounded-xl font-bold text-sm shadow-sm group-hover:scale-105 transition z-10 border border-red-100">
            구출하기 &rarr;
          </div>
        </button>
      )}

      {/* Feature 5: Bidirectional Toggle */}
      <div className="flex justify-center">
        <button 
          onClick={() => { audioService.playClick(); onToggleReverse(); }}
          className={`flex items-center gap-3 px-8 py-3 rounded-full text-sm font-bold transition-all shadow-sm active:scale-95 ${
            isReverse 
              ? 'bg-purple-600 text-white ring-4 ring-purple-100 scale-105' 
              : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
        >
          <ArrowRightLeft size={16} />
          {isReverse ? "모드: 뜻 보고 영어 말하기 (Hard)" : "모드: 영어 보고 뜻 말하기 (Normal)"}
        </button>
      </div>

      {/* Upload Box */}
      <div 
        className={`relative border-4 border-dashed rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer group ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) {
             const reader = new FileReader();
             reader.onload = (ev) => processText(ev.target?.result as string);
             reader.readAsText(file);
          }
        }}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          accept=".txt,.csv"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-4 relative z-10 pointer-events-none">
          <div className="bg-indigo-100 p-5 rounded-full text-indigo-600 group-hover:scale-110 transition-transform duration-300">
            <Upload size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-700">파일 업로드</h3>
            <p className="text-sm text-slate-400 mt-1">.txt, .csv, 엑셀 파일 등</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">1. apple 사과</span>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">apple, 사과</span>
                <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded border border-purple-100 font-medium">1. apple (자동번역)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Input */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
            <FileText size={16} /> 직접 입력 / 붙여넣기
          </label>
          <button 
            onClick={handleGenAI}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:opacity-90 transition shadow-md active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <span className="animate-spin">⏳</span> : <Sparkles size={14} />}
            {isLoading ? "AI가 생각 중..." : "AI 자동 생성"}
          </button>
        </div>
        <div className="relative group">
            <textarea 
            className="w-full h-40 p-5 rounded-2xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none resize-none text-base font-mono leading-relaxed transition-all shadow-inner"
            placeholder={`1. apple 사과\n2. banana 바나나\n3. spark\n(복사 붙여넣기만 하면 알아서 정리해드립니다)`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-slate-900/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <div className="text-white font-bold animate-pulse flex items-center gap-2">
                        <Zap className="text-yellow-400" /> 단어 분석 및 생성 중...
                    </div>
                </div>
            )}
        </div>
        
        <button 
          onClick={() => { audioService.playClick(); processText(inputText); }}
          disabled={isLoading}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Zap size={20} className="text-yellow-400" /> 학습 시작하기
        </button>
      </div>
    </div>
  );
};