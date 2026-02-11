
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
    <div className="rounded-3xl shadow-lg overflow-hidden transform hover:-translate-y-3 transition-all duration-300 ease-in-out flex flex-col"
      style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,230,211,0.9) 100%)', border: '2px solid #d4c5b9'}}>
      <img src={website.thumbnailUrl} alt={website.name} className="w-full h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2" style={{color: '#4a4a4a'}}>{website.name}</h3>
        <p className="flex-grow mb-6" style={{color: '#6b6b6b'}}>{website.description}</p>
        <div className="mt-auto flex justify-end gap-3">
          <button className="p-2 rounded-full transition-all hover:bg-white hover:shadow-md" aria-label="Visit site" style={{color: '#a8d8a8'}}>
            <ExternalLinkIcon />
          </button>
          <button
            onClick={handleEditClick}
            className="p-2 rounded-full transition-all hover:bg-white hover:shadow-md"
            aria-label="Edit site"
            style={{color: '#a8d4e8'}}
          >
            <EditIcon />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-full transition-all hover:bg-white hover:shadow-md"
            aria-label="Delete site"
            style={{color: '#e8b4a8'}}
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