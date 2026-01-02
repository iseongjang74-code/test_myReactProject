
import React from 'react';
import { BusinessCard } from './components/BusinessCard';

const App: React.FC = () => {
  const cardDetails = {
    name: "Derek Jang",
    status: "Student at WMS",
    age: 15,
    motto: "오늘도 내일처럼 내일도 오늘처럼",
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-4">
      <BusinessCard
        name={cardDetails.name}
        status={cardDetails.status}
        age={cardDetails.age}
        motto={cardDetails.motto}
      />
    </main>
  );
};

export default App;
