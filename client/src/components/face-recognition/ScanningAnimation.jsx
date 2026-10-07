import React from 'react';

const ScanningAnimation = ({ state }) => {
  if (state !== 'SCANNING' && state !== 'FACE_DETECTED' && state !== 'VERIFYING') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="w-64 h-64 md:w-80 md:h-80 relative overflow-hidden rounded-2xl">
        {/* Scanning line moving up and down */}
        <div className="absolute left-0 w-full h-1 bg-sk-yellow shadow-[0_0_10px_#FACC15] animate-scan-line"></div>
        
        {/* Pulse effect when verifying */}
        {state === 'VERIFYING' && (
          <div className="absolute inset-0 border-4 border-sk-info rounded-2xl animate-pulse-ring"></div>
        )}
      </div>
    </div>
  );
};

export default ScanningAnimation;
