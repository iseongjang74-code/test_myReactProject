import React from 'react';
import { AUTO_CLICK_TIERS } from '../constants';
import { AutoClickTier } from '../../../../types';
import LightningIcon from './icons/LightningIcon';

interface AutoClickStoreProps {
  onPurchase: (tier: AutoClickTier) => void;
  onClose: () => void;
  currentTier: AutoClickTier | null;
}

const AutoClickStore: React.FC<AutoClickStoreProps> = ({ onPurchase, onClose, currentTier }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close store"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center justify-center mb-4">
            <LightningIcon className="w-8 h-8 text-yellow-400 mr-2" />
            <h2 className="text-3xl font-bold text-yellow-400">Auto-Click Upgrades</h2>
        </div>
        <p className="text-gray-300 mb-8">Purchase an auto-clicker to boost your nation's score automatically!</p>
        
        <div className="space-y-4">
          {AUTO_CLICK_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between transition-all ${
                currentTier === tier.id ? 'bg-green-600 border-2 border-green-400' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="text-left mb-4 sm:mb-0">
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <p className="text-gray-300">{tier.clicksPerSecond} clicks / second</p>
                {currentTier === tier.id && <p className="text-sm font-bold text-white mt-1">ACTIVE</p>}
              </div>
              <button
                onClick={() => onPurchase(tier.id)}
                disabled={currentTier === tier.id}
                className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded-md hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {tier.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoClickStore;
