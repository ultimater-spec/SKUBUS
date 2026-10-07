import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStudentById, registerFace, validateFace } from '../../../services/studentService';

const FaceRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, ACTIVE, SCANNING, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  const [samples, setSamples] = useState([]);
  const TOTAL_SAMPLES = 5;
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const processingRef = useRef(false);

  const fetchStudent = useCallback(async () => {
    try {
      const res = await getStudentById(id);
      if (res.status) {
        setStudent(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student details');
      navigate('/admin/students');
    }
  }, [id, navigate]);

  const startCamera = async () => {
    setStatus('ACTIVE');
    setErrorMessage('');
    setSamples([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
      setErrorMessage('Camera access denied or unavailable.');
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
  }, []);

  useEffect(() => {
    fetchStudent();
    return () => {
      stopCamera();
    };
  }, [fetchStudent, stopCamera]);

  const completeRegistration = async (finalSamples) => {
    setStatus('PROCESSING');
    stopCamera();
    try {
      const res = await registerFace(id, { encodings: finalSamples });
      if (res.status) {
        setStatus('SUCCESS');
        toast.success('Face registered successfully!');
      } else {
        setStatus('ERROR');
        setErrorMessage(res.message);
      }
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
      setErrorMessage(err.response?.data?.message || 'Failed to save face registration.');
    }
  };

  const captureLoop = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || status !== 'SCANNING' || processingRef.current) return;
    
    // Only capture if video is playing
    if (videoRef.current.readyState < 2) return;

    processingRef.current = true;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    try {
      const res = await validateFace(id, imageData);
      if (res.status && res.data?.encoding) {
        setErrorMessage('');
        setSamples(prev => {
          const newSamples = [...prev, res.data.encoding];
          if (newSamples.length >= TOTAL_SAMPLES) {
            completeRegistration(newSamples);
          }
          return newSamples;
        });
      } else {
        setErrorMessage(res.message || 'Invalid face');
      }
    } catch (err) {
       setErrorMessage(err.response?.data?.message || 'Error validating face');
    }
    
    processingRef.current = false;
  }, [id, status]);

  useEffect(() => {
    let interval;
    if (status === 'SCANNING') {
       interval = setInterval(captureLoop, 1000); 
    }
    return () => clearInterval(interval);
  }, [status, captureLoop]);

  const getStatusIcon = () => {
    switch(status) {
      case 'SUCCESS': return <CheckCircle className="w-12 h-12 text-sk-success animate-in zoom-in" />;
      case 'ERROR': return <XCircle className="w-12 h-12 text-sk-error animate-in zoom-in" />;
      case 'PROCESSING': return <RefreshCw className="w-12 h-12 text-sk-info animate-spin" />;
      default: return null;
    }
  };

  if (!student) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/admin/students/${id}`)} className="p-2 bg-white rounded-lg shadow-sm border border-sk-border hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-sk-navy">Face Registration</h1>
          <p className="text-gray-500 text-sm">Enroll {student.name} ({student.studentId})</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-sk-border overflow-hidden flex flex-col items-center justify-center p-8 min-h-[500px] relative">
        
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-sk-navy mb-2">
            {status === 'SUCCESS' ? 'Face Registered Successfully' : 'Align Face in the Center'}
          </h2>
          {status !== 'SUCCESS' && (
            <p className="text-gray-500 text-sm max-w-md mx-auto h-10">
              {errorMessage ? (
                <span className="text-red-500 font-medium flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errorMessage}
                </span>
              ) : status === 'SCANNING' ? (
                <span className="text-sk-info font-medium animate-pulse">Scanning in progress... Please hold still.</span>
              ) : (
                'Ensure the face is clearly visible, well-lit, and not wearing sunglasses or masks.'
              )}
            </p>
          )}
        </div>

        {/* Camera Container */}
        <div className="relative w-72 h-72 rounded-full border-8 border-gray-100 bg-sk-navy flex flex-col items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.1)] transition-all duration-300">
          
          {status === 'SCANNING' && (
            <>
              <div className="absolute inset-0 border-[6px] border-sk-yellow rounded-full animate-pulse-glow z-10 pointer-events-none"></div>
              <div className="absolute left-0 w-full h-[2px] bg-sk-yellow shadow-[0_0_10px_#facc15] z-20 animate-scan-line pointer-events-none"></div>
            </>
          )}

          <video 
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${['ACTIVE', 'SCANNING'].includes(status) ? 'opacity-100' : 'opacity-0'}`}
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {!['ACTIVE', 'SCANNING'].includes(status) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-30 text-sk-navy p-6 text-center">
              {getStatusIcon()}
              
              {status === 'IDLE' && (
                <div className="flex flex-col items-center text-gray-400">
                  <Camera className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Ready</span>
                </div>
              )}
              
              {status === 'SUCCESS' && (
                <span className="text-sm font-bold text-sk-success mt-2">Face Recognition Ready</span>
              )}
            </div>
          )}
        </div>

        {/* Progress Tracker */}
        {['ACTIVE', 'SCANNING'].includes(status) && (
          <div className="mt-8 flex flex-col items-center w-full max-w-sm">
            <div className="flex justify-between w-full mb-2">
              <span className="text-sm font-semibold text-gray-600">Registration Progress</span>
              <span className="text-sm font-bold text-sk-navy">{samples.length} / {TOTAL_SAMPLES}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sk-yellow transition-all duration-500 ease-out"
                style={{ width: `${(samples.length / TOTAL_SAMPLES) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-10 flex gap-4">
          {(status === 'IDLE' || status === 'ERROR') ? (
            <button onClick={startCamera} className="px-6 py-3 bg-sk-navy text-white font-bold rounded-xl hover:bg-sk-navy-light transition-colors shadow-md flex items-center gap-2">
              <Camera className="w-5 h-5" /> {status === 'ERROR' ? 'Try Again' : (student.faceRecognitionEnabled ? 'Update Face' : 'Start Camera')}
            </button>
          ) : status === 'ACTIVE' ? (
            <>
              <button onClick={() => setStatus('SCANNING')} className="px-8 py-3 bg-sk-yellow text-sk-navy font-bold rounded-xl hover:bg-sk-yellow-dark transition-colors shadow-lg flex items-center gap-2 transform hover:scale-105">
                Begin Scanning
              </button>
              <button onClick={() => { stopCamera(); setStatus('IDLE'); }} className="px-6 py-3 bg-white text-gray-600 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                Cancel
              </button>
            </>
          ) : status === 'SCANNING' ? (
             <button onClick={() => setStatus('ACTIVE')} className="px-6 py-3 bg-white text-gray-600 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                Pause Scanning
              </button>
          ) : status === 'SUCCESS' ? (
             <>
                <button onClick={() => navigate('/admin/students')} className="px-6 py-3 bg-sk-navy text-white font-bold rounded-xl hover:bg-sk-navy-light transition-colors shadow-md">
                  Back to Students
                </button>
                <button onClick={() => { setStatus('IDLE'); setSamples([]); }} className="px-6 py-3 bg-white text-gray-600 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                  Register Again
                </button>
             </>
          ) : (
            <button disabled className="px-6 py-3 bg-gray-100 text-gray-400 font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-not-allowed">
              <RefreshCw className="w-5 h-5 animate-spin" /> Processing...
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default FaceRegistration;
