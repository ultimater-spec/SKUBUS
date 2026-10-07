import React from 'react';
import { AlertCircle, Scan, Loader2, UserX, Users } from 'lucide-react';

const RecognitionStatus = ({ state, error }) => {
  
  const getStatusContent = () => {
    switch (state) {
      case 'SCANNING':
        return { text: 'Scanning for student...', icon: <Scan className="w-5 h-5 animate-pulse" />, color: 'bg-black/60 text-white' };
      case 'FACE_DETECTED':
        return { text: 'Face detected', icon: <Scan className="w-5 h-5" />, color: 'bg-sk-yellow text-sk-navy' };
      case 'VERIFYING':
        return { text: 'Verifying identity...', icon: <Loader2 className="w-5 h-5 animate-spin" />, color: 'bg-sk-info text-white' };
      case 'NO_FACE':
        return { text: 'No face detected', icon: <UserX className="w-5 h-5" />, color: 'bg-black/60 text-white' };
      case 'MULTIPLE_FACES':
        return { text: 'Multiple faces detected', icon: <Users className="w-5 h-5" />, color: 'bg-sk-warning text-sk-navy' };
      case 'UNKNOWN_FACE':
        return { text: 'Student not recognized', icon: <AlertCircle className="w-5 h-5" />, color: 'bg-sk-error text-white' };
      case 'ERROR':
        return { text: error || 'Recognition failed', icon: <AlertCircle className="w-5 h-5" />, color: 'bg-sk-error text-white' };
      default:
        return null;
    }
  };

  const content = getStatusContent();

  if (!content) return null;

  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-in slide-in-from-bottom-4 fade-in">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-lg backdrop-blur-sm ${content.color}`}>
        {content.icon}
        <span>{content.text}</span>
      </div>
    </div>
  );
};

export default RecognitionStatus;
