import React, { useState, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Website, WebsiteCategory } from '../../types';
import WebsiteCard from '../../components/WebsiteCard';
import CreateWebsiteModal from '../../components/CreateWebsiteModal';
import { PlusIcon } from '../../components/icons/PlusIcon';

interface LayoutContextType {
  activeCategory: 'All' | WebsiteCategory;
  setActiveCategory: (category: 'All' | WebsiteCategory) => void;
}

const Homepage: React.FC = () => {
  const { activeCategory, setActiveCategory } = useOutletContext<LayoutContextType>();
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: 1,
      name: "My Portfolio",
      description: "A professional portfolio showcasing my projects and skills in software development.",
      thumbnailUrl: "https://picsum.photos/seed/portfolio/600/400",
      category: 'MBTI',
      path: '/DilemmaSimulator',
    },
    {
      id: 2,
      name: "Travel Blog",
      description: "Documenting my adventures around the world with photos and stories.",
      thumbnailUrl: "https://picsum.photos/seed/travel/600/400",
      category: 'Game',
      path: '/travel-blog',
    },
    {
      id: 3,
      name: "Recipe Corner",
      description: "A collection of my favorite family recipes, from appetizers to desserts.",
      thumbnailUrl: "https://picsum.photos/seed/recipes/600/400",
      category: 'MBTI',
      path: '/recipe-corner',
    },
     {
      id: 4,
      name: "Gaming Community",
      description: "A forum for gamers to discuss strategies and new releases.",
      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",
      category: 'Game',
      path: '/gaming-community',
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateWebsite = useCallback((newWebsiteData: Omit<Website, 'id' | 'thumbnailUrl' | 'path'>) => {
    setWebsites(prevWebsites => [
      ...prevWebsites,
      {
        ...newWebsiteData,
        id: Date.now(),
        thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
        path: `/${newWebsiteData.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
    ]);
    setIsModalOpen(false);
  }, []);

  const handleDeleteWebsite = useCallback((id: number) => {
    setWebsites(prevWebsites => prevWebsites.filter(website => website.id !== id));
  }, []);

  const filteredWebsites = useMemo(() => {
    if (activeCategory === 'All') {
      return websites;
    }
    return websites.filter(website => website.category === activeCategory);
  }, [websites, activeCategory]);

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">My Sites</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          <PlusIcon />
          New Site
        </button>
      </div>

      {filteredWebsites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWebsites.map(website => (
            <WebsiteCard
              key={website.id}
              website={website}
              onDelete={handleDeleteWebsite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
           {websites.length === 0 ? (
              <>
                  <h2 className="text-2xl font-semibold mb-4">No Websites Yet!</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    It looks a bit empty here. Click the "New Site" button to start your first project.
                  </p>
                  <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
                  >
                      <PlusIcon />
                      Create Your First Site
                  </button>
              </>
          ) : (
               <>
                  <h2 className="text-2xl font-semibold mb-4">No Websites in this Category</h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    There are no sites matching the category "{activeCategory}".
                  </p>
               </>
          )}
        </div>
      )}
      <CreateWebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateWebsite}
      />
      {/* Removed inline detail modal: cards now navigate to their `path` routes */}
    </div>
  );
};

export default Homepage;
