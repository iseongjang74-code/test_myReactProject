import React, { useState } from 'react';
import { CloseIcon, KeyIcon } from './icons';

interface PasswordPromptModalProps {
    onConfirm: (password: string) => boolean;
    onClose: () => void;
}

const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({ onConfirm, onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isCorrect = onConfirm(password);
        if (!isCorrect) {
            setError('비밀번호가 틀렸습니다.');
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="relative w-full max-w-sm bg-gray-800 rounded-lg border border-gray-700 shadow-2xl p-6 space-y-4"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="text-center">
                    <KeyIcon className="w-12 h-12 mx-auto text-cyan-400 mb-2" />
                    <h2 className="text-2xl font-bold text-white">비밀번호 확인</h2>
                    <p className="text-sm text-gray-400">구매를 계속하려면 비밀번호를 입력하세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                        }}
                        placeholder="비밀번호"
                        className={`w-full px-4 py-3 bg-gray-700 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${error ? 'border-red-500' : 'border-gray-600 focus:border-cyan-500'}`}
                        autoFocus
                    />

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={!password}
                        className="w-full p-3 rounded-lg bg-cyan-600 text-white font-bold text-lg hover:bg-cyan-500 transition-colors disabled:opacity-50"
                    >
                        확인
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordPromptModal;