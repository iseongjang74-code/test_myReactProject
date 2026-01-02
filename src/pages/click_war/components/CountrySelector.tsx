
import React, { useState } from 'react';
import { Country } from '../../../../types';
import { COUNTRIES } from '../constants';
import { getFlagEmoji } from '../utils';

interface CountrySelectorProps {
  onSelectCountry: (country: Country) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ onSelectCountry }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const handleConfirm = () => {
    if (selectedCountry) {
      onSelectCountry(selectedCountry);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-6 text-center overflow-hidden">
      <div className="animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4 tracking-tighter uppercase">
          Global Click War
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto font-medium">
          Represent your nation in the ultimate worldwide tapping competition. 
          Choose wisely — your allegiance is permanent.
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full max-w-5xl animate-fade-in-delayed">
        {COUNTRIES.map((country) => (
          <button
            key={country.code}
            onClick={() => setSelectedCountry(country)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 group border-2 ${
              selectedCountry?.code === country.code 
                ? 'bg-yellow-500 border-yellow-400 text-gray-900 shadow-[0_0_30px_rgba(234,179,8,0.3)] ring-4 ring-yellow-400/20' 
                : 'bg-gray-900/50 border-gray-800 text-white hover:bg-gray-800 hover:border-gray-700'
            }`}
          >
            <span className="text-6xl mb-3 group-hover:scale-110 transition-transform">
              {getFlagEmoji(country.code)}
            </span>
            <span className="font-black text-xs uppercase tracking-widest">{country.name}</span>
          </button>
        ))}
      </div>

      {selectedCountry && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl border border-gray-800 text-center max-w-md w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
            <div className="text-9xl mb-6 drop-shadow-2xl">{getFlagEmoji(selectedCountry.code)}</div>
            <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tight">Enlist for {selectedCountry.name}?</h2>
            <p className="text-gray-400 mb-8 leading-relaxed font-medium">
              You are about to represent <span className="text-yellow-400 font-bold">{selectedCountry.name}</span> in the global arena. 
              This decision is final. Are you ready to tap for glory?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                className="w-full py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black rounded-2xl hover:from-yellow-300 hover:to-orange-400 transition-all shadow-xl shadow-yellow-500/20 uppercase tracking-[0.2em] text-sm"
              >
                Enter the War Room
              </button>
              <button
                onClick={() => setSelectedCountry(null)}
                className="w-full py-4 bg-gray-800/50 text-gray-400 font-bold rounded-2xl hover:bg-gray-800 hover:text-white transition-colors uppercase tracking-widest text-[10px]"
              >
                Choose another nation
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-delayed { opacity: 0; animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CountrySelector;
