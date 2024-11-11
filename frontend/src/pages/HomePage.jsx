// src/pages/HomePage.jsx

import React from 'react';
import GridBackground from '../components/ui/GridBackground';

const HomePage = () => {
  return (
    <GridBackground>
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-5xl font-bold mb-4">Welcome to SmartKart!</h1>
      </main>
    </GridBackground>
  );
};

export default HomePage;
