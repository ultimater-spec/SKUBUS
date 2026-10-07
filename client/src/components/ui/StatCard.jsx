import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className="bg-white rounded-xl border border-sk-border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-sk-navy">{value}</p>
        </div>
        {Icon && (
          <div className="p-3 bg-sk-yellow-background rounded-lg">
            <Icon className="w-6 h-6 text-sk-yellow-dark" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={trend.isPositive ? 'text-sk-success' : 'text-sk-error'}>
            {trend.value}
          </span>
          <span className="ml-2 text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
