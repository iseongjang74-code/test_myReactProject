
import React from 'react';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UserIcon } from './icons/UserIcon';
import { QuoteIcon } from './icons/QuoteIcon';

interface BusinessCardProps {
  name: string;
  status: string;
  age: number;
  motto: string;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ name, status, age, motto }) => {
  return (
    <div className="w-96 h-60 bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{name}</h1>
        <div className="w-20 h-1 bg-slate-400 my-4 rounded-full"></div>
        <p className="text-lg text-slate-600">{status}</p>
      </header>

      <div className="flex items-center space-x-3 text-slate-500">
        <QuoteIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <p className="text-sm italic">"{motto}"</p>
      </div>
      
      <footer className="flex items-center space-x-6 text-slate-500">
        <div className="flex items-center space-x-2">
          <UserIcon className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium">{age} Years Old</span>
        </div>
        <div className="flex items-center space-x-2">
          <BriefcaseIcon className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium">Student</span>
        </div>
      </footer>
    </div>
  );
};
