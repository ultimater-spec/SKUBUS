import React from 'react';
import FaceScanner from '../components/face-recognition/FaceScanner';
import PageHeader from '../components/layout/PageHeader';

const StaffScanner = () => {
  return (
    <div>
      <PageHeader 
        title="Face Recognition Scanner" 
        description="Scan students as they board or leave the bus to automatically mark attendance."
      />
      <div className="bg-white rounded-xl shadow-sm border border-sk-border p-4 md:p-6">
        <FaceScanner />
      </div>
    </div>
  );
};

export default StaffScanner;
