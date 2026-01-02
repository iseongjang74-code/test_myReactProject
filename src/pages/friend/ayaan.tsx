
import React, { useState, useEffect, useMemo } from 'react';
import { SocialFriend, RelationshipType } from '../../../types';
import AddFriendModal from './components/AddFriendModal';
import FriendCard from './components/FriendCard';

const App: React.FC = () => {
  const [friends, setFriends] = useState<SocialFriend[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<RelationshipType | 'ALL'>('ALL');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('friendlink_friends');
    if (saved) {
      try {
        setFriends(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load friends');
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('friendlink_friends', JSON.stringify(friends));
  }, [friends]);

  const handleAddFriend = (newFriendData: Omit<SocialFriend, 'id' | 'createdAt'>) => {
    const newFriend: SocialFriend = {
      ...newFriendData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setFriends(prev => [newFriend, ...prev]);
  };

  const handleDeleteFriend = (id: string) => {
    if (confirm('이 친구를 목록에서 삭제할까요?')) {
      setFriends(prev => prev.filter(f => f.id !== id));
    }
  };

  const filteredFriends = useMemo(() => {
    return friends.filter(friend => {
      const matchesSearch = friend.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (friend.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'ALL' || friend.relationship === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [friends, searchTerm, activeFilter]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-user-friends text-xl"></i>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">FriendLink</h1>
          </div>
          <div className="relative flex-1 max-w-md">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="친구 검색..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center overflow-x-auto pb-4 gap-2 no-scrollbar">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'ALL' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            전체
          </button>
          {Object.values(RelationshipType).map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === type 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mb-6 flex justify-between items-center text-sm text-gray-500">
          <span>총 <strong>{filteredFriends.length}명</strong>의 친구</span>
          {searchTerm && <span>검색 결과: {filteredFriends.length}건</span>}
        </div>

        {/* Friend List */}
        {filteredFriends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFriends.map((friend) => (
              <FriendCard 
                key={friend.id} 
                friend={friend} 
                onDelete={handleDeleteFriend} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <i className="fas fa-users-slash text-3xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900">친구가 아직 없나요?</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">
              우측 하단의 버튼을 눌러 소중한 인연들을 저장해 보세요.
            </p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <i className="fas fa-plus text-xl transition-transform group-hover:rotate-90"></i>
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          새 친구 추가
        </span>
      </button>

      <AddFriendModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddFriend}
      />
    </div>
  );
};

export default App;
