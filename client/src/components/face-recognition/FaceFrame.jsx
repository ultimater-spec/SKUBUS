import React from 'react';

const FaceFrame = ({ state }) => {
  let borderColor = 'border-white/50';
  let scale = 'scale-100';

  if (state === 'FACE_DETECTED') {
    borderColor = 'border-sk-yellow shadow-[0_0_20px_rgba(250,204,21,0.5)]';
    scale = 'scale-105 transition-transform duration-300';
  } else if (state === 'VERIFYING') {
    borderColor = 'border-sk-info';
    scale = 'scale-105';
  } else if (state === 'ERROR' || state === 'UNKNOWN_FACE' || state === 'NO_FACE') {
    borderColor = 'border-sk-error';
  } else if (state === 'ATTENDANCE_MARKED') {
    borderColor = 'border-sk-success';
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Bounding box guide */}
      <div className={`w-64 h-64 md:w-80 md:h-80 border-2 rounded-2xl relative ${borderColor} ${scale}`}>
        {/* Corner markers */}
        <div className={`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-xl ${borderColor}`}></div>
        <div className={`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-xl ${borderColor}`}></div>
        <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-xl ${borderColor}`}></div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-xl ${borderColor}`}></div>
      </div>
    </div>
  );
};

export default FaceFrame;
