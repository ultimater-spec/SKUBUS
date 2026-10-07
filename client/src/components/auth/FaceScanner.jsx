import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { faceLogin } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const FaceScanner = ({ onCancel }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState('IDLE'); // IDLE, STARTING, ACTIVE, VERIFYING, SUCCESS, ERROR, UNKNOWN_FACE
  const [statusMsg, setStatusMsg] = useState('Ready to scan');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Track status to avoid capturing when not active
  const statusRef = useRef(status);
  
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    setStatus('STARTING');
    setStatusMsg('Starting camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setStatus('ACTIVE');
          setStatusMsg('Position your face inside the frame');
          
          // Throttle face detection: capture a frame every 1.5 seconds
          intervalRef.current = setInterval(captureAndVerify, 1500);
        };
      }
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
      setStatusMsg('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndVerify = async () => {
    if (statusRef.current === 'VERIFYING' || statusRef.current === 'SUCCESS') return;
    if (!videoRef.current || !canvasRef.current) return;
    
    // Draw current frame to canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    setStatus('VERIFYING');
    setStatusMsg('Verifying your identity...');
    
    try {
      const resultAction = await dispatch(faceLogin(imageData));
      if (faceLogin.fulfilled.match(resultAction)) {
        setStatus('SUCCESS');
        setStatusMsg('Identity verified');
        toast.success('Face recognized! Logging in...');
        stopCamera();
      } else {
        // If not recognized or error
        setStatus('UNKNOWN_FACE');
        setStatusMsg('Face not recognized. Please try again.');
        // Resume after 2 seconds
        setTimeout(() => {
          if (streamRef.current && statusRef.current !== 'SUCCESS') {
            setStatus('ACTIVE');
            setStatusMsg('Position your face inside the frame');
          }
        }, 2000);
      }
    } catch (error) {
      setStatus('ERROR');
      setStatusMsg('Face recognition unavailable');
      stopCamera();
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'SUCCESS': return <CheckCircle className="w-8 h-8 text-sk-success animate-in zoom-in" />;
      case 'ERROR': return <XCircle className="w-8 h-8 text-sk-error animate-in zoom-in" />;
      case 'UNKNOWN_FACE': return <AlertCircle className="w-8 h-8 text-sk-error animate-in zoom-in" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center animate-in fade-in duration-300">
      
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-[40px] border-4 border-sk-border bg-sk-navy flex flex-col items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.05)] transition-all duration-300">
        
        {/* Animated Glow Border (CSS only) */}
        {status === 'ACTIVE' && (
          <div className="absolute inset-0 border-[4px] border-sk-yellow rounded-[36px] animate-pulse-glow z-10 pointer-events-none"></div>
        )}

        {/* Scanning Corners */}
        {status === 'ACTIVE' && (
          <>
            <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-sk-yellow rounded-tl-xl z-20 pointer-events-none"></div>
            <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-sk-yellow rounded-tr-xl z-20 pointer-events-none"></div>
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-sk-yellow rounded-bl-xl z-20 pointer-events-none"></div>
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-sk-yellow rounded-br-xl z-20 pointer-events-none"></div>
          </>
        )}

        {/* Scanning Line */}
        {status === 'ACTIVE' && (
          <div className="absolute left-0 w-full h-[2px] bg-sk-yellow shadow-[0_0_10px_#facc15] z-20 animate-scan-line pointer-events-none"></div>
        )}

        {/* Video Feed */}
        <video 
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${['ACTIVE', 'VERIFYING', 'STARTING', 'UNKNOWN_FACE'].includes(status) ? 'opacity-100' : 'opacity-0'}`}
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Status Overlay */}
        {!['ACTIVE', 'STARTING', 'UNKNOWN_FACE'].includes(status) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-sk-navy/90 z-30 text-white p-6 text-center backdrop-blur-sm">
            {getStatusIcon()}
            {status === 'VERIFYING' && <RefreshCw className="w-8 h-8 text-sk-yellow animate-spin" />}
          </div>
        )}
      </div>

      <div className="mt-6 text-center min-h-[40px]">
        <p className={`text-sm font-semibold ${status === 'SUCCESS' ? 'text-sk-success' : status === 'ERROR' || status === 'UNKNOWN_FACE' ? 'text-sk-error' : 'text-gray-600'} transition-colors duration-300`}>
          {statusMsg}
        </p>
      </div>

      <button 
        type="button" 
        onClick={onCancel}
        className="mt-4 px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-sk-navy border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Use Password Instead
      </button>
    </div>
  );
};

export default FaceScanner;
