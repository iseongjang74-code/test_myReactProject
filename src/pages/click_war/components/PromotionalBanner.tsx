import React, { useState } from 'react';

const PromotionalBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-3 text-center text-gray-900 font-bold relative shadow-lg">
      <p>
        <span className="font-extrabold text-lg">SPECIAL EVENT!</span> Achieve over 100,000 clicks for an exclusive reward!
      </p>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-800 hover:text-black"
        aria-label="Dismiss promotional message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default PromotionalBanner;
