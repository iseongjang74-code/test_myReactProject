
import React from 'react';
import IntroductionCard from './components/IntroductionCard';
import FullscreenContainer from '../../../components/FullscreenContainer';

const myCard: React.FC = () => {
  const userProfile = {
    name: 'Daniel',
    likes: ['자동차', '자전거', '전자기기', '잘 놀기'],
    motto: '흘러가는 대로 구르는 대로 부딪히는 대로 밀리는 대로',
    imageUrl: '/image.png'
  };

  return (
    <FullscreenContainer>
      <main className="bg-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <IntroductionCard
          name={userProfile.name}
          likes={userProfile.likes}
          motto={userProfile.motto}
          imageUrl={userProfile.imageUrl}
        />
      </main>
    </FullscreenContainer>
  );
};

export default myCard;