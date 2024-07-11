// src/App.tsx
import React from 'react';
import {  Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import DrawingRoom from './components/DrawingRoom';

const App: React.FC = () => {
  return (

      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/draw/:roomId" element={<DrawingRoom />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      

  );
};

export default App;