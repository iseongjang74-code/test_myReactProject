import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 rounded-t-3xl" style={{background: 'linear-gradient(90deg, #a8d4e8 0%, #a8d8a8 100%)'}}>
      <div className="container mx-auto px-4 py-10 text-center text-white">
        <p className="text-sm font-medium">
          &copy; {new Date().getFullYear()} Website Builder. All rights reserved.
        </p>
        <p className="text-xs mt-3 text-white text-opacity-90">
          With ✨ Ghibli Charm ✨
        </p>
      </div>
    </footer>
  );
};

export default Footer;
