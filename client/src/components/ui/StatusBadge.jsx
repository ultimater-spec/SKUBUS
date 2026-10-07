import React from 'react';

const StatusBadge = ({ status, text }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'present':
      case 'resolved':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
      case 'absent':
      case 'rejected':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      case 'in progress':
      case 'in_progress':
      case 'late':
      case 'warning':
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {text || status}
    </span>
  );
};

export default StatusBadge;
