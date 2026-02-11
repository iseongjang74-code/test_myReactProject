
import React, { useState } from 'react';
// Changed Stock to Asset to fix the module export error
import { Asset, UserPortfolio } from '../../../../types';

interface TradeModalProps {
  // Changed Stock to Asset to match types.ts
  stock: Asset;
  portfolio: UserPortfolio;
  onClose: () => void;
  onTrade: (type: 'BUY' | 'SELL', quantity: number) => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ stock, portfolio, onClose, onTrade }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');

  const holding = portfolio.holdings.find(h => h.symbol === stock.symbol);
  const maxBuy = Math.floor(portfolio.balance / stock.price);
  const maxSell = holding ? holding.quantity : 0;

  const handleTrade = () => {
    if (quantity <= 0) return;
    if (type === 'BUY' && quantity > maxBuy) return;
    if (type === 'SELL' && quantity > maxSell) return;
    
    onTrade(type, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{stock.name} 거래</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setType('BUY')}
            className={`flex-1 py-3 rounded-xl font-bold transition ${type === 'BUY' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            매수
          </button>
          <button 
            onClick={() => setType('SELL')}
            className={`flex-1 py-3 rounded-xl font-bold transition ${type === 'SELL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            매도
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">현재가</span>
            <span className="font-semibold text-gray-900">{stock.price.toLocaleString()} KRW</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">주문가능</span>
            <span className="font-semibold text-gray-900">
              {type === 'BUY' ? `${portfolio.balance.toLocaleString()} KRW` : `${maxSell} 주`}
            </span>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                max={type === 'BUY' ? maxBuy : maxSell}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={() => setQuantity(type === 'BUY' ? maxBuy : maxSell)}
                className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                최대
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between text-lg font-bold">
              <span>총 금액</span>
              <span className={type === 'BUY' ? 'text-red-500' : 'text-blue-600'}>
                {(stock.price * quantity).toLocaleString()} KRW
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleTrade}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition transform active:scale-95 ${
            type === 'BUY' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {type === 'BUY' ? '매수하기' : '매도하기'}
        </button>
      </div>
    </div>
  );
};

export default TradeModal;
