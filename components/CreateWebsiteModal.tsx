import React, { useState, useEffect } from 'react';
import { Website, WebsiteCategory } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface CreateWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (websiteData: Omit<Website, 'id' | 'thumbnailUrl'>) => void;
}

const CreateWebsiteModal: React.FC<CreateWebsiteModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WebsiteCategory>('Game');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setCategory('Game');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onCreate({ name, description, category });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Website</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="website-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Website Name
            </label>
            <input
              type="text"
              id="website-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., My Awesome Project"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="website-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="website-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="A brief description of what your website is about."
              required
            ></textarea>
          </div>
           <div className="mb-6">
            <label htmlFor="website-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              id="website-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as WebsiteCategory)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Game">게임</option>
              <option value="MBTI">MBTI</option>
            </select>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 disabled:bg-sky-300 dark:disabled:bg-sky-800 disabled:cursor-not-allowed transition-colors"
              disabled={!name.trim() || !description.trim()}
            >
              Create Site
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateWebsiteModal;
