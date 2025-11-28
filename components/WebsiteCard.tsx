
import React from 'react';
import { Website } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface WebsiteCardProps {
  website: Website;
  onDelete: (id: number) => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out flex flex-col">
      <img src={website.thumbnailUrl} alt={website.name} className="w-full h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{website.name}</h3>
        <p className="text-slate-600 dark:text-slate-400 flex-grow mb-6">{website.description}</p>
        <div className="mt-auto flex justify-end gap-2">
          <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Visit site">
            <ExternalLinkIcon />
          </button>
          <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Edit site">
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(website.id)}
            className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            aria-label="Delete site"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteCard;
