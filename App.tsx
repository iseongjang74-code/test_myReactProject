import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './src/pages/Layout';
import Homepage from './src/pages/Homepage';
import DilemmaSimulator from './src/pages/DilemmaSimulator';
function App() {
  return (
    <BrowserRouter basename="/test_myReactProject">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          {/* 여기에 새로운 페이지 라우트를 추가할 예정입니다. */}
          <Route path="DilemmaSimulator" element={<DilemmaSimulator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;