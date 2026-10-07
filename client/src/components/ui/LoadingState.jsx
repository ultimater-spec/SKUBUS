import React from 'react';

const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-64">
      <div className="w-12 h-12 border-4 border-sk-yellow-light border-t-sk-yellow rounded-full animate-spin"></div>
      <p className="mt-4 text-sk-navy font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;
