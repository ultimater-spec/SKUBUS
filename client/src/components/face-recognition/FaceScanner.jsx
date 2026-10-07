import React, { useRef, useState, useEffect, useCallback } from 'react';
import FaceFrame from './FaceFrame';
import ScanningAnimation from './ScanningAnimation';
import RecognitionStatus from './RecognitionStatus';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';
import { Camera, XCircle } from 'lucide-react';

const SCAN_STATES = {
  IDLE: 'IDLE',
  SCANNING: 'SCANNING',
  FACE_DETECTED: 'FACE_DETECTED',
  VERIFYING: 'VERIFYING',
  ATTENDANCE_MARKED: 'ATTENDANCE_MARKED',
  NO_FACE: 'NO_FACE',
  MULTIPLE_FACES: 'MULTIPLE_FACES',
  UNKNOWN_FACE: 'UNKNOWN_FACE',
  ERROR: 'ERROR'
};

const FaceScanner = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [scanState, setScanState] = useState(SCAN_STATES.IDLE);
  const [hasPermission, setHasPermission] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setScanState(SCAN_STATES.SCANNING);
        setErrorMessage('');
        
        // TEMPORARY MOCK LOGIC for UI demonstration
        mockRecognitionProcess();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
      setScanState(SCAN_STATES.ERROR);
      setErrorMessage('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasPermission(false);
    setScanState(SCAN_STATES.IDLE);
  }, []);

  useEffect(() => {
    return () => stopCamera(); // Cleanup on unmount
  }, [stopCamera]);

  // Temporary function to mock the UI states
  const mockRecognitionProcess = () => {
    setTimeout(() => {
      setScanState(SCAN_STATES.FACE_DETECTED);
      setTimeout(() => {
        setScanState(SCAN_STATES.VERIFYING);
        setTimeout(() => {
          setScanState(SCAN_STATES.ATTENDANCE_MARKED);
          setResult({
            name: 'Akhil Raj',
            id: 'STU1024',
            className: 'Class 10 A',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            bus: 'SKB-04',
            route: 'Payyannur → School'
          });
          // Stop camera scanning after success
          setTimeout(() => {
            stopCamera();
          }, 3000);
        }, 800);
      }, 600);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <div className="w-full bg-sk-navy rounded-2xl overflow-hidden shadow-2xl relative aspect-[4/3] md:aspect-[16/9] flex items-center justify-center">
        
        {/* Video Element */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover ${!hasPermission ? 'hidden' : ''}`}
        />

        {/* IDLE State */}
        {scanState === SCAN_STATES.IDLE && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-sk-navy">
            <Camera className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">Ready to Scan</h3>
            <p className="text-gray-400 mb-6">Position yourself in front of the camera</p>
            <PrimaryButton onClick={startCamera}>
              Start Scanner
            </PrimaryButton>
          </div>
        )}

        {/* Overlay Animations based on state */}
        {hasPermission && (
          <div className="absolute inset-0 pointer-events-none">
            <FaceFrame state={scanState} />
            {(scanState === SCAN_STATES.SCANNING || scanState === SCAN_STATES.FACE_DETECTED || scanState === SCAN_STATES.VERIFYING) && (
              <ScanningAnimation state={scanState} />
            )}
          </div>
        )}

        {/* Status Text Overlay */}
        {hasPermission && scanState !== SCAN_STATES.ATTENDANCE_MARKED && (
          <RecognitionStatus state={scanState} error={errorMessage} />
        )}

        {/* Success Overlay */}
        {scanState === SCAN_STATES.ATTENDANCE_MARKED && result && (
          <div className="absolute inset-0 bg-sk-navy/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all translate-y-0 text-center">
              <div className="w-16 h-16 bg-sk-success rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-sk-navy mb-1">Attendance Marked</h2>
              <p className="text-gray-500 mb-6">{result.time}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 text-left border border-gray-100">
                <p className="font-bold text-lg text-sk-navy">{result.name}</p>
                <p className="text-sm text-gray-600 mb-2">{result.id} • {result.className}</p>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <p className="text-sm"><span className="text-gray-500">Bus:</span> <span className="font-medium text-sk-navy">{result.bus}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Route:</span> <span className="font-medium text-sk-navy">{result.route}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls below scanner */}
      {hasPermission && (
        <div className="mt-6">
          <SecondaryButton onClick={stopCamera} className="text-red-600 hover:text-red-700">
            <XCircle className="w-5 h-5 mr-2" />
            Stop Scanning
          </SecondaryButton>
        </div>
      )}
    </div>
  );
};

export default FaceScanner;
