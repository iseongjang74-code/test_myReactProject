
import React from 'react';
import { Character } from '../types';
import CharacterCard from './CharacterCard';

interface GachaResultModalProps {
    results: Character[];
    onClose: () => void;
}

const GachaResultModal: React.FC<GachaResultModalProps> = ({ results, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-2xl bg-gray-900/80 backdrop-blur-sm rounded-lg border-2 border-yellow-400 shadow-2xl p-6 space-y-4"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-3xl font-bold text-center text-yellow-300 drop-shadow-lg">소환 결과</h2>
                
                <div className={`grid gap-3 ${results.length > 1 ? 'grid-cols-5' : 'grid-cols-1 place-items-center'}`}>
                    {results.map((char, index) => (
                        <div key={index} className="animate-reveal" style={{ animationDelay: `${index * 100}ms` }}>
                             <CharacterCard character={char} />
                        </div>
                    ))}
                </div>

                <button 
                    onClick={onClose} 
                    className="w-full mt-4 p-3 rounded-lg bg-cyan-600 text-white font-bold text-lg hover:bg-cyan-500 transition-colors"
                >
                    확인
                </button>
            </div>
        </div>
    );
};

export default GachaResultModal;
