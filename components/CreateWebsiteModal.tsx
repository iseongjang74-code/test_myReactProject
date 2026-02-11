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
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
        style={{background: 'linear-gradient(135deg, #fefaf0 0%, #f5e6d3 100%)', border: '3px solid #d4c5b9', animation: 'fade-in-scale 0.3s forwards'}}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{color: '#4a4a4a'}}>✨ Create New Website</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            aria-label="Close modal"
            style={{color: '#a8d4e8'}}
          >
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="website-name" className="block text-sm font-medium mb-1" style={{color: '#4a4a4a'}}>
              Website Name
            </label>
            <input
              type="text"
              id="website-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl shadow-sm focus:outline-none focus:ring-4"
              style={{border: '2px solid #d4c5b9', background: '#fefaf0', color: '#4a4a4a', focusRingColor: 'rgba(168, 216, 168, 0.3)'}}
              placeholder="e.g., My Awesome Project"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="website-description" className="block text-sm font-medium mb-1" style={{color: '#4a4a4a'}}>
              Description
            </label>
            <textarea
              id="website-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-2xl shadow-sm focus:outline-none focus:ring-4"
              style={{border: '2px solid #d4c5b9', background: '#fefaf0', color: '#4a4a4a'}}
              placeholder="A brief description of what your website is about."
              required
            ></textarea>
          </div>
           <div className="mb-6">
            <label htmlFor="website-category" className="block text-sm font-medium mb-1" style={{color: '#4a4a4a'}}>
              Category
            </label>
            <select
              id="website-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as WebsiteCategory)}
              className="w-full px-3 py-2 rounded-2xl shadow-sm focus:outline-none"
              style={{border: '2px solid #d4c5b9', background: '#fefaf0', color: '#4a4a4a'}}
            >
              <option value="Game">게임</option>
              <option value="MBTI">MBTI</option>
            </select>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl font-medium transition-all hover:shadow-md"
              style={{background: '#f5d5b8', color: '#4a4a4a', border: '2px solid #d4c5b9'}}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white font-bold rounded-2xl transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              style={{background: 'linear-gradient(135deg, #a8d8a8 0%, #a8d4e8 100%)'}}
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
