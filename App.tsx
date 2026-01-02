import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './src/pages/Layout';
import Homepage from './src/pages/Homepage';
import DilemmaSimulator from './src/pages/DilemmaSimulator';
import MyCard from './src/pages/myCard/myCard';
import Gacha from './src/pages/gacha/ass';
import Last_night from './src/pages/last_night/joshua'
import Mordern from './src/pages/mordern/onyu'
import Word from './src/pages/word/peter'
import Word2 from './src/pages/word2/kai'
import ClickWar from './src/pages/click_war/jacob'
import Friend from './src/pages/friend/ayaan'
import Math from './src/pages/math/danny'
function App() {
  return (
    <BrowserRouter basename="/test_myReactProject">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          {/* 여기에 새로운 페이지 라우트를 추가할 예정입니다. */}
          <Route path="DilemmaSimulator" element={<DilemmaSimulator />} />
        
         <Route path="myCard" element={<MyCard />} />
         <Route path="gacha" element={<Gacha />} />
        <Route path="Last_night" element={<Last_night />} />
        <Route path="mordern" element={<Mordern />} />
        <Route path="word" element={<Word />} />
        <Route path="word2" element={<Word2 />} />
        <Route path="click_war" element={<ClickWar />} />
        <Route path="friend" element={<Friend />} />
        <Route path="math" element={<Math />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;