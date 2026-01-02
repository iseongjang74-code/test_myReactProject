import React, { useState } from 'react';
import { CloseIcon, CreditCardIcon } from './icons';

interface CurrencyPack {
    name: string;
    amount: number;
    price: string;
}

interface PurchaseModalProps {
    pack: CurrencyPack;
    onConfirm: () => void;
    onClose: () => void;
}

type PurchaseState = 'idle' | 'processing' | 'success';

const PurchaseModal: React.FC<PurchaseModalProps> = ({ pack, onConfirm, onClose }) => {
    const [purchaseState, setPurchaseState] = useState<PurchaseState>('idle');

    const handleConfirm = () => {
        setPurchaseState('processing');
        setTimeout(() => {
            setPurchaseState('success');
            setTimeout(() => {
                onConfirm();
            }, 1000); // Show success message for a bit
        }, 1500); // Simulate network delay
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="relative w-full max-w-md bg-gray-800 rounded-lg border border-gray-700 shadow-2xl p-6 space-y-4"
                onClick={e => e.stopPropagation()}
            >
                {purchaseState === 'idle' && (
                     <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                )}
               
                <div className="text-center">
                    <CreditCardIcon className="w-12 h-12 mx-auto text-cyan-400 mb-2" />
                    <h2 className="text-2xl font-bold text-white">구매 확인</h2>
                </div>

                {purchaseState === 'idle' && (
                    <>
                        <div className="bg-gray-900/50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">상품</span>
                                <span className="font-semibold text-white">{pack.name} ({pack.amount.toLocaleString()} 보석)</span>
                            </div>
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-gray-400">총 결제 금액</span>
                                <span className="font-bold text-cyan-300">{pack.price}</span>
                            </div>
                        </div>

                        <div className="text-center p-3 bg-yellow-900/50 border border-yellow-700 rounded-md">
                            <p className="text-xs text-yellow-300">이것은 시뮬레이션입니다.<br/>실제 결제가 이루어지지 않으며, 정보를 입력할 필요가 없습니다.</p>
                        </div>
                        
                        <button 
                            onClick={handleConfirm} 
                            className="w-full mt-4 p-3 rounded-lg bg-cyan-600 text-white font-bold text-lg hover:bg-cyan-500 transition-colors"
                        >
                            결제 확정
                        </button>
                    </>
                )}

                {purchaseState === 'processing' && (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-300">결제 처리 중...</p>
                    </div>
                )}

                {purchaseState === 'success' && (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-green-400 font-bold text-xl">구매 성공!</p>
                        <p className="text-gray-300">{pack.amount.toLocaleString()}개의 보석이 지급되었습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseModal;
