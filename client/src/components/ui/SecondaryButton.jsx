import React from 'react';

const SecondaryButton = ({ children, onClick, type = 'button', disabled = false, className = '', ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center px-4 py-2 border border-sk-border text-sm font-medium rounded-md text-sk-navy bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sk-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
