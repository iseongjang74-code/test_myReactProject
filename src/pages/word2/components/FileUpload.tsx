import React, { useCallback } from 'react';
import { Upload, FileText, HelpCircle } from 'lucide-react';
import { Word } from '../../../../types';
import { playClickSound } from '../services/audio';

interface FileUploadProps {
  onWordsLoaded: (words: Word[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onWordsLoaded }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    playClickSound();
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target?.result as string;
      
      // 1. Remove BOM (Byte Order Mark) which often causes the first column to be misread
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
      }

      const lines = text.split(/\r?\n/); // Handle both CRLF (Windows) and LF (Unix)
      const parsedWords: Word[] = [];

      lines.forEach((line, index) => {
        if (!line.trim()) return;
        
        // Basic quote cleanup (handles simple "word" cases)
        const cleanLine = line.replace(/"/g, '');
        
        // Auto-detect delimiter: Tab -> Comma -> Semicolon
        let parts: string[] = [];
        if (cleanLine.includes('\t')) {
          parts = cleanLine.split('\t');
        } else if (cleanLine.includes(',')) {
          parts = cleanLine.split(',');
        } else {
          parts = cleanLine.split(';'); // Fallback
        }
        
        parts = parts.map(s => s.trim());

        let term = '';
        let definition = '';

        // Intelligent Column Detection
        // Strategy: Check if the first column looks like a number (Index)
        // Regex checks for digits, potentially followed by a dot (e.g., "1", "1.")
        const firstColIsIndex = /^[0-9]+[\.]?$/.test(parts[0]); 

        if (parts.length >= 3 && firstColIsIndex) {
           // Case: Index | Term | Definition
           term = parts[1];
           definition = parts[2];
        } else if (parts.length >= 2) {
           // Case: Term | Definition
           // If the first column was a number but we only have 2 columns, likely "Index | Term" (no definition) or "Term | Def"
           // But since we prioritize Term/Def, we take col 0 and 1.
           // HOWEVER, if col 0 is definitely a number and col 1 is text, it might be "1, Word" with missing definition.
           // To be safe, if it looks like an index, we might warn, but for now let's assume standard format.
           term = parts[0];
           definition = parts[1];
        }

        // Filter out header rows
        const isHeader = ['word', 'term', 'english', 'no', 'number', '단어', '순서', '뜻', '의미', 'meaning'].includes(term.toLowerCase());

        if (term && definition && !isHeader) {
          parsedWords.push({
            id: `word-${Date.now()}-${index}`,
            term,
            definition,
            isMemorized: false,
            status: 'new'
          });
        }
      });

      if (parsedWords.length > 0) {
        onWordsLoaded(parsedWords);
      } else {
        alert("단어를 인식할 수 없습니다. 파일 형식을 확인해주세요.\n(예시: apple, 사과  또는  1, apple, 사과)");
      }
    };
    reader.readAsText(file);
  }, [onWordsLoaded]);

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm border-2 border-dashed border-blue-200 text-center hover:border-blue-400 transition-colors cursor-pointer group">
      <label className="cursor-pointer flex flex-col items-center">
        <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
          <Upload className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">단어장 파일 업로드</h3>
        <p className="text-sm text-slate-500 mb-4">CSV, 엑셀(csv저장) 파일</p>
        <input 
          type="file" 
          accept=".csv, .txt" 
          onChange={handleFileUpload} 
          className="hidden" 
        />
        <div className="flex flex-col gap-2 text-xs text-slate-400 bg-slate-50 px-4 py-3 rounded-xl text-left w-full">
          <div className="flex items-center gap-2 font-medium text-slate-500 mb-1">
            <HelpCircle size={12} />
            <span>지원 형식</span>
          </div>
          <div>1. apple, 사과</div>
          <div>2. 1, apple, 사과 (번호 자동 제외)</div>
        </div>
      </label>
    </div>
  );
};