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
      name: "DilemmaSimulator",
      description: "A professional portfolio showcasing my projects and skills in software development.",
      thumbnailUrl: "https://picsum.photos/seed/portfolio/600/400",
      category: 'MBTI',
      path: '/DilemmaSimulator',
    },
         {
      id:2,
      name: "card",
      description: "A fordddddscuss strategies and new releases.",
      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",
      category: 'Game',
      path: '/myCard',
    },
{
      id: 3,
      name: "gacha",
      description: "A forum for gamerjjjjjjs to discuss strategies and new releases.",
      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",
      category: 'Game',
      path: '/gacha',
    },
{
      id: 4,
      name: "last night",
      description: "A forum for gaaaaaaamers to discuss strategies and new releases.",
      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",
      category: 'Game',
      path: '/last_night',
    },
      {
      id: 5,
      name: "mordern",
      description: "A forum for gaaaaaaamers to discuss strategies and new releases.",
      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",
      category: 'Game',
      path: '/mordern',
    },{
      id: 6,
      name: "word",
      description: "A forum for gaaaaaaamers to discuss strategies and new releases.",
      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",
      category: 'Game',
      path: '/word',
    },{
      id: 7,
      name: "word2",
      description: "A forum for gaaaaaaamers to discuss strategies and new releases.",
      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",
      category: 'Game',
      path: '/word2',
    },{
      id: 8,
      name: "click war",
      description: "A forum for gaaaaaaamers to discuss strategies and new releases.",
      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",
      category: 'Game',
      path: '/click_war',
    },{
      id: 9,
      name: "friend",
      description: "A forum for gaaaaaaamers to discuss strategies and new releases.",
      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",
      category: 'Game',
      path: '/friend',
    },{
      id: 10,
      name: "math",
      description: "A forum for gaaaaaaamers to discuss strategies and new releases.",
      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",
      category: 'Game',
      path: '/math',
    },{

      id: 11,

      name: "AI_voca",

      description: "A forum for gaaaaaamers to discuss strategies and new releases.",

      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",

      category: 'Game',

      path: '/AI_voca',

    },{

      id: 12,

      name: "snake_game",

      description: "play snake game.",

      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",

      category: 'Game',

      path: '/snake_game',

    },,{

      id: 13,

      name: "trdder_coin",

      description: "play dlab game.",

      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",

      category: 'mbti',

      path: '/trdder_coin',

    },{

      id: 13,

      name: "Dlab",

      description: "play dlab game.",

      thumbnailUrl: "https://picsum.photos/seed/gaming/600/400",

      category: 'mbti',

      path: '/Dlab',

    }


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
        <h1 className="text-4xl md:text-5xl font-bold" style={{color: '#4a4a4a', textShadow: '2px 2px 4px rgba(0,0,0,0.1)'}}>✨ My Sites ✨</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 font-bold py-3 px-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200 text-white"
          style={{background: 'linear-gradient(135deg, #a8d8a8 0%, #a8d4e8 100%)'}}
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
        <div className="text-center py-16 px-6 rounded-3xl shadow-lg" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,230,211,0.9) 100%)', border: '2px solid #d4c5b9'}}>
           {websites.length === 0 ? (
              <>
                  <h2 className="text-3xl font-semibold mb-4" style={{color: '#4a4a4a'}}>No Websites Yet! 🌸</h2>
                  <p className="mb-6" style={{color: '#6b6b6b'}}>
                    It looks a bit empty here. Click the "New Site" button to start your first project.
                  </p>
                  <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200"
                      style={{background: 'linear-gradient(135deg, #a8d8a8 0%, #a8d4e8 100%)'}}
                  >
                      <PlusIcon />
                      Create Your First Site
                  </button>
              </>
          ) : (
               <>
                  <h2 className="text-2xl font-semibold mb-4" style={{color: '#4a4a4a'}}>No Websites in this Category</h2>
                  <p style={{color: '#6b6b6b'}}>
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
