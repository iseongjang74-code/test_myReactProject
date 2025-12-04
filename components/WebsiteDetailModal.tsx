import React from 'react';
import { Website } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface WebsiteDetailModalProps {
  website: Website | null;
  onClose: () => void;
}

const WebsiteDetailModal: React.FC<WebsiteDetailModalProps> = ({ website, onClose }) => {
  if (!website) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Close Button */}
        <div className="flex justify-end p-4 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Thumbnail */}
          <img
            src={website.thumbnailUrl}
            alt={website.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />

          {/* Title */}
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {website.name}
          </h2>

          {/* Category */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-full text-sm font-semibold">
              {website.category}
            </span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Description
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
              {website.description}
            </p>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Website ID</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{website.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Category</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{website.category}</p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteDetailModal;
