import React from 'react';

const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-sk-navy">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="mt-4 sm:mt-0 sm:ml-4 flex gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
