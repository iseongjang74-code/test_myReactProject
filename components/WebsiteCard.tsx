
import React from 'react';
import { Link } from 'react-router-dom';
import { Website } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface WebsiteCardProps {
  website: Website;
  onDelete: (id: number) => void;
}

const CardInner: React.FC<{ website: Website; onDelete: (id: number) => void }> = ({ website, onDelete }) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(website.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Placeholder: wire edit behavior here if needed
  };

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
          <button
            onClick={handleEditClick}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Edit site"
          >
            <EditIcon />
          </button>
          <button
            onClick={handleDeleteClick}
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

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onDelete }) => {
  if (website.path) {
    return (
      <Link to={website.path} className="block hover:scale-[1.01] transition-transform duration-150">
        <CardInner website={website} onDelete={onDelete} />
      </Link>
    );
  }

  return <CardInner website={website} onDelete={onDelete} />;
};

export default WebsiteCard;