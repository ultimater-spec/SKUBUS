import React from 'react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const location = useLocation();
  const path = location.pathname.split('/').pop();
  const title = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-sk-yellow-background p-6 rounded-full mb-6">
        <Construction className="w-16 h-16 text-sk-yellow-dark" />
      </div>
      <h1 className="text-3xl font-bold text-sk-navy mb-4">{title} Module</h1>
      <p className="text-gray-500 max-w-md text-lg">
        This module is currently under construction. Please check back later.
      </p>
    </div>
  );
};

export default PlaceholderPage;
