import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertCircle, 
  AlertTriangle, 
  User, 
  Check, 
  Trash2, 
  RotateCcw, 
  ShieldCheck, 
  Video, 
  VideoOff, 
  Info, 
  Search,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStudents, getStudentById, registerFace, validateFace } from '../../../services/studentService';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const FaceRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Student selection state
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Active method: 'choose' (upload) or 'capture' (webcam)
  const [activeTab, setActiveTab] = useState('choose');

  // Photo state
  const [selectedImage, setSelectedImage] = useState(null); // base64 string
  const [imageMeta, setImageMeta] = useState(null); // { name, size, type, source: 'upload' | 'camera' }
  const [fileError, setFileError] = useState('');

  // Camera state
  const [cameraState, setCameraState] = useState('IDLE'); // IDLE, ASKING_PERMISSION, ACTIVE, CAPTURED, ERROR
  const [cameraError, setCameraError] = useState('');
  const [capturedPreview, setCapturedPreview] = useState(null);

  // Duplicate / overwrite confirmation state
  const [overwriteConfirmed, setOverwriteConfirmed] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Fetch Students
  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await getStudents();
      const studentsList = res?.data || [];
      setAllStudents(studentsList);

      if (id) {
        const found = studentsList.find((s) => s._id === id);
        if (found) {
          setSelectedStudent(found);
        } else {
          // If not in the list, fetch by ID directly
          const singleRes = await getStudentById(id);
          if (singleRes?.status && singleRes.data) {
            setSelectedStudent(singleRes.data);
          }
        }
      }
    } catch (err) {
      console.error('Error loading students:', err);
      toast.error('Failed to load students list');
    } finally {
      setLoadingStudents(false);
    }
  }, [id]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Reset overwrite confirmation whenever selected student changes
  useEffect(() => {
    setOverwriteConfirmed(false);
    setServerError('');
  }, [selectedStudent]);

  // 2. Camera Controls & Lifecycle Cleanup
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // When switching away from camera tab, stop camera
  const handleTabSwitch = (tab) => {
    if (tab !== 'capture' && streamRef.current) {
      stopCameraStream();
      setCameraState('IDLE');
    }
    setActiveTab(tab);
    setServerError('');
  };

  // Request & Start Camera
  const handleOpenCamera = async () => {
    setCameraError('');
    setServerError('');
    setCameraState('ASKING_PERMISSION');

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('ERROR');
      setCameraError('Camera access is not supported by your browser. Please use the Choose Image option or update your browser.');
      return;
    }

    // Check secure context
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setCameraState('ERROR');
      setCameraError('Camera access requires a secure HTTPS connection or localhost.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraState('ACTIVE');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.error('Video play error:', e));
        };
      }
    } catch (err) {
      console.error('Camera open error:', err);
      setCameraState('ERROR');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser address bar permissions and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on your device. Please connect a webcam or use the Choose Image option.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is already in use by another application or browser tab. Please close other camera apps and retry.');
      } else {
        setCameraError(err.message || 'Unable to access camera. Please check your system camera settings.');
      }
    }
  };

  // Capture Current Video Frame
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Use video native aspect ratio
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Stop video stream after capture
    stopCameraStream();

    setCapturedPreview(dataUrl);
    setCameraState('CAPTURED');
  };

  // Retake Photo
  const handleRetakePhoto = () => {
    setCapturedPreview(null);
    handleOpenCamera();
  };

  // Accept Captured Photo
  const handleUseCapturedPhoto = () => {
    if (!capturedPreview) return;
    setSelectedImage(capturedPreview);
    setImageMeta({
      name: `webcam_capture_${new Date().toISOString().slice(0, 10)}.jpg`,
      size: Math.round((capturedPreview.length * 3) / 4),
      type: 'image/jpeg',
      source: 'camera',
    });
    setCameraState('IDLE');
    setCapturedPreview(null);
    toast.success('Photo captured and selected!');
  };

  // 3. File Picker / Upload Controls
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
    // Reset file input value so selecting the same file again triggers onChange
    e.target.value = '';
  };

  const processUploadedFile = (file) => {
    setFileError('');
    setServerError('');

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setFileError('Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller photo.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setSelectedImage(result);
        setImageMeta({
          name: file.name,
          size: file.size,
          type: file.type,
          source: 'upload',
        });
        toast.success('Image selected successfully!');
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read the image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageMeta(null);
    setFileError('');
    setServerError('');
    setOverwriteConfirmed(false);
  };

  // 4. Registration Submission
  const handleSubmitRegistration = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student to link the face photo with.');
      return;
    }

    if (!selectedImage) {
      toast.error('Please choose an image or take a photo first.');
      return;
    }

    if (selectedStudent.faceRecognitionEnabled && !overwriteConfirmed) {
      toast.error('Please confirm overwriting the existing face registration.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      // Send image to backend registerFace endpoint
      const response = await registerFace(selectedStudent._id, {
        image: selectedImage,
      });

      if (response?.status) {
        setRegistrationSuccess(true);
        toast.success(`Face registered successfully for ${selectedStudent.name}!`);
        // Refresh student record in local state
        setSelectedStudent((prev) => ({
          ...prev,
          faceRecognitionEnabled: true,
          profileImage: selectedImage,
        }));
      } else {
        setServerError(response?.message || 'Face registration failed. Please try another photo.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to register student face.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setSelectedImage(null);
    setImageMeta(null);
    setCapturedPreview(null);
    setCameraState('IDLE');
    setRegistrationSuccess(false);
    setServerError('');
    setOverwriteConfirmed(false);
    if (!id) {
      setSelectedStudent(null);
    }
    loadStudents();
  };

  // Filter students for search dropdown
  const filteredStudents = allStudents.filter((s) => {
    const q = studentSearch.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.studentId?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Hidden Canvas for Webcam Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* HEADER & NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sk-border pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(selectedStudent ? `/admin/students/${selectedStudent._id}` : '/admin/students')}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-sk-border hover:bg-sk-yellow-light text-sk-navy transition-all"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-sk-navy" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sk-yellow-light text-sk-navy border border-sk-yellow">
                SKUBUS AI
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-sk-navy tracking-tight">
                Register Student Face
              </h1>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              Enroll or update a student's facial profile for automated bus attendance.
            </p>
          </div>
        </div>

        {selectedStudent && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-sk-border shadow-sm text-sm">
            <User className="w-4 h-4 text-sk-yellow-dark" />
            <span className="font-semibold text-sk-navy">{selectedStudent.name}</span>
            <span className="text-gray-400 font-mono text-xs">({selectedStudent.studentId})</span>
          </div>
        )}
      </div>

      {/* SUCCESS STATE MODAL / CARD */}
      {registrationSuccess ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-sk-yellow shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-50 border-4 border-green-200 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-sk-navy">Face Registered Successfully!</h2>
            <p className="text-gray-600 text-sm">
              Facial recognition has been activated for <strong className="text-sk-navy">{selectedStudent?.name}</strong>. The student will now be automatically recognized during bus check-in and check-out.
            </p>
          </div>

          {/* Student Profile Card Preview */}
          <div className="bg-sk-yellow-background border border-sk-yellow/40 rounded-2xl p-5 max-w-sm mx-auto flex items-center gap-4 text-left shadow-sm">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-sk-yellow shadow-sm shrink-0">
              <img src={selectedImage} alt={selectedStudent?.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sk-navy text-base truncate">{selectedStudent?.name}</p>
              <p className="text-xs text-gray-500 font-mono">ID: {selectedStudent?.studentId}</p>
              <p className="text-xs text-gray-600 mt-1">Class: {selectedStudent?.className || 'N/A'}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3" /> Face Enrolled
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleResetForAnother}
              className="px-6 py-3 bg-sk-yellow text-sk-navy font-bold rounded-xl hover:bg-sk-yellow-dark shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Register Another Student
            </button>
            <button
              onClick={() => navigate(`/admin/students/${selectedStudent?._id}`)}
              className="px-6 py-3 bg-sk-navy text-white font-bold rounded-xl hover:bg-sk-navy-light shadow-md transition-all"
            >
              View Student Profile
            </button>
            <button
              onClick={() => navigate('/admin/students')}
              className="px-5 py-3 bg-white text-gray-600 font-bold border border-sk-border rounded-xl hover:bg-gray-50 transition-all"
            >
              Back to Students List
            </button>
          </div>
        </div>
      ) : (
        /* MAIN WORKFLOW GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: PHOTO SELECTION / CAPTURE (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Method Switcher Tabs */}
            <div className="bg-white p-1.5 rounded-2xl border border-sk-border shadow-sm flex gap-2">
              <button
                type="button"
                onClick={() => handleTabSwitch('choose')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'choose'
                    ? 'bg-sk-yellow text-sk-navy shadow-md ring-2 ring-sk-yellow-dark/20'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Choose Image</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('capture')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'capture'
                    ? 'bg-sk-yellow text-sk-navy shadow-md ring-2 ring-sk-yellow-dark/20'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </button>
            </div>

            {/* 2. CHOOSE IMAGE PANEL */}
            {activeTab === 'choose' && (
              <div className="bg-white rounded-2xl border border-sk-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sk-navy flex items-center gap-2">
                    <Upload className="w-4 h-4 text-sk-yellow-dark" /> Upload Existing Photo
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">JPG, PNG, WEBP (Max 5MB)</span>
                </div>

                {!selectedImage ? (
                  /* Dropzone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) processUploadedFile(file);
                    }}
                    className="border-2 border-dashed border-gray-300 hover:border-sk-yellow bg-gray-50/70 hover:bg-sk-yellow-background/40 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 group-hover:border-sk-yellow shadow-sm flex items-center justify-center text-gray-400 group-hover:text-sk-navy transition-all mb-4">
                      <Upload className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="font-bold text-sk-navy text-base">
                      Click to choose an image <span className="text-gray-400 font-normal">or drag & drop</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1.5 max-w-sm">
                      Select a front-facing, high-contrast photo of the student with neutral lighting.
                    </p>
                  </div>
                ) : (
                  /* Image Preview Card */
                  <div className="space-y-4 animate-in fade-in">
                    <div className="relative w-full max-h-80 bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-md border border-gray-200">
                      <img
                        src={selectedImage}
                        alt="Selected Student"
                        className="max-h-80 w-auto object-contain"
                      />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-green-400" /> Photo Ready
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                      <div className="text-xs text-gray-600 truncate max-w-xs">
                        <p className="font-bold text-sk-navy truncate">{imageMeta?.name || 'student_photo.jpg'}</p>
                        <p className="text-gray-400">
                          {imageMeta?.size ? `${(imageMeta.size / 1024).toFixed(1)} KB` : 'Ready'} • {imageMeta?.source === 'camera' ? 'Webcam' : 'Uploaded'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 sm:flex-none px-3.5 py-1.5 bg-white border border-gray-200 text-sk-navy font-semibold text-xs rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                        >
                          Replace Image
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {fileError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. TAKE PHOTO (WEBCAM) PANEL */}
            {activeTab === 'capture' && (
              <div className="bg-white rounded-2xl border border-sk-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sk-navy flex items-center gap-2">
                    <Camera className="w-4 h-4 text-sk-yellow-dark" /> Live Webcam Capture
                  </h3>
                  {cameraState === 'ACTIVE' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full animate-pulse border border-red-200">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span> Live Camera
                    </span>
                  )}
                </div>

                {/* State A: Idle - Info Message & Open Button */}
                {cameraState === 'IDLE' && !selectedImage && (
                  <div className="bg-sk-yellow-background border border-sk-yellow/40 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                    <div className="w-14 h-14 bg-white border border-sk-yellow rounded-2xl flex items-center justify-center text-sk-navy mx-auto shadow-sm">
                      <Camera className="w-7 h-7 text-sk-yellow-dark" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                      <h4 className="font-bold text-sk-navy text-base">Camera Permission Required</h4>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        SKUBUS needs access to your camera to capture the student's photo for face recognition. Please allow camera access when your browser asks for permission.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCamera}
                      className="px-6 py-3 bg-sk-yellow text-sk-navy font-extrabold rounded-xl hover:bg-sk-yellow-dark shadow-md transition-all flex items-center gap-2 mx-auto"
                    >
                      <Video className="w-4 h-4" /> Allow Camera Access / Open Camera
                    </button>
                  </div>
                )}

                {/* State B: In-flight permission asking */}
                {cameraState === 'ASKING_PERMISSION' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-sk-yellow-dark animate-spin mx-auto" />
                    <p className="font-bold text-sk-navy text-sm">Requesting Camera Permission...</p>
                    <p className="text-xs text-gray-500">Please click "Allow" in the browser popup prompt above.</p>
                  </div>
                )}

                {/* State C: Active Camera Stream */}
                {cameraState === 'ACTIVE' && (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-lg flex items-center justify-center border-4 border-sk-navy">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]" /* Mirrored for natural selfie feel */
                      />

                      {/* Face Alignment Oval Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 sm:w-56 h-64 sm:h-72 border-2 border-dashed border-sk-yellow/90 rounded-[50%] shadow-[0_0_20px_rgba(250,204,21,0.3)] flex flex-col justify-between items-center py-4">
                          <span className="text-[11px] font-bold text-sk-yellow bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            Align Student Face Here
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="px-8 py-3 bg-sk-yellow text-sk-navy font-extrabold rounded-xl hover:bg-sk-yellow-dark shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                      >
                        <Camera className="w-5 h-5" /> Capture Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopCameraStream();
                          setCameraState('IDLE');
                        }}
                        className="px-4 py-3 bg-white text-gray-600 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* State D: Photo Captured - Preview and Choice */}
                {cameraState === 'CAPTURED' && capturedPreview && (
                  <div className="space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="relative w-full max-h-80 bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-lg border-2 border-sk-yellow">
                      <img src={capturedPreview} alt="Captured Student" className="max-h-80 w-auto object-contain scale-x-[-1]" />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white flex items-center gap-1.5 font-bold">
                        <Check className="w-3.5 h-3.5 text-green-400" /> Frame Captured
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleUseCapturedPhoto}
                        className="px-6 py-2.5 bg-sk-yellow text-sk-navy font-bold rounded-xl hover:bg-sk-yellow-dark shadow-md transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Use This Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleRetakePhoto}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> Retake Photo
                      </button>
                    </div>
                  </div>
                )}

                {/* State E: Camera has already produced a selected image */}
                {cameraState === 'IDLE' && selectedImage && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="relative w-full max-h-80 bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-md border border-gray-200">
                      <img src={selectedImage} alt="Captured Student" className="max-h-80 w-auto object-contain" />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-green-400" /> Photo Accepted
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-xs text-gray-600 font-medium">Captured via Camera</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOpenCamera}
                          className="px-3.5 py-1.5 bg-white border border-gray-200 text-sk-navy font-semibold text-xs rounded-lg hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Retake Photo
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Camera Error Message */}
                {cameraError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-red-700 text-xs">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span className="font-semibold">{cameraError}</span>
                    </div>
                    <div className="pl-6 pt-1">
                      <button
                        type="button"
                        onClick={handleOpenCamera}
                        className="font-bold underline text-red-800 hover:text-red-900"
                      >
                        Try opening camera again
                      </button>
                      <span className="text-gray-500 mx-2">or</span>
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('choose')}
                        className="font-bold text-sk-navy underline"
                      >
                        switch to Choose Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: LINK STUDENT & VERIFICATION (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Student Link Card */}
            <div className="bg-white rounded-2xl border border-sk-border p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-sk-navy flex items-center gap-2 text-base">
                  <User className="w-4 h-4 text-sk-yellow-dark" /> Link Photo to Student
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  Select the student record to enroll this face encoding with.
                </p>
              </div>

              {/* Student Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-sk-navy uppercase tracking-wider">
                  Select Student <span className="text-red-500">*</span>
                </label>

                {loadingStudents ? (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading students list...
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedStudent?._id || ''}
                      onChange={(e) => {
                        const s = allStudents.find((st) => st._id === e.target.value);
                        setSelectedStudent(s || null);
                      }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-sk-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow transition-all"
                    >
                      <option value="">-- Choose a Student --</option>
                      {allStudents.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name} ({st.studentId}) {st.faceRecognitionEnabled ? '✓ [Enrolled]' : ''}
                        </option>
                      ))}
                    </select>

                    {allStudents.length > 5 && (
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Quick search student..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sk-yellow"
                        />
                        {studentSearch && (
                          <div className="absolute z-20 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg text-xs divide-y divide-gray-100">
                            {filteredStudents.length > 0 ? (
                              filteredStudents.map((s) => (
                                <div
                                  key={s._id}
                                  onClick={() => {
                                    setSelectedStudent(s);
                                    setStudentSearch('');
                                  }}
                                  className="p-2.5 hover:bg-sk-yellow-light cursor-pointer flex items-center justify-between"
                                >
                                  <div>
                                    <p className="font-bold text-sk-navy">{s.name}</p>
                                    <p className="text-[11px] text-gray-500 font-mono">ID: {s.studentId}</p>
                                  </div>
                                  {s.faceRecognitionEnabled ? (
                                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                                      Enrolled
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-gray-400">Not enrolled</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-gray-400 text-center">No students matching "{studentSearch}"</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Student Details Card */}
              {selectedStudent && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 animate-in fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sk-navy text-base">{selectedStudent.name}</p>
                      <p className="text-xs text-gray-500 font-mono">Student ID: {selectedStudent.studentId}</p>
                    </div>
                    {selectedStudent.faceRecognitionEnabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                        <Check className="w-3 h-3" /> Face Enrolled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-200/80 px-2.5 py-1 rounded-full">
                        Not Enrolled
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-200 text-gray-600">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Class & Sec:</span>
                      <span className="font-semibold text-sk-navy">
                        {selectedStudent.className || 'N/A'} {selectedStudent.division || ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Assigned Bus:</span>
                      <span className="font-semibold text-sk-navy">
                        {selectedStudent.assignedBus?.busNumber || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* DUPLICATE ACCIDENTAL OVERWRITE WARNING */}
                  {selectedStudent.faceRecognitionEnabled && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900 mt-2">
                      <div className="flex items-start gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Face Already Registered</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        This student already has an active face recognition profile. Registering a new photo will replace and update their facial vector data.
                      </p>
                      <label className="flex items-start gap-2 pt-1 font-semibold text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={overwriteConfirmed}
                          onChange={(e) => setOverwriteConfirmed(e.target.checked)}
                          className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span>I confirm that I want to update/overwrite the existing face profile</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* SERVER / VALIDATION ERROR BANNER */}
              {serverError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Registration Error</p>
                    <p className="text-[11px] leading-relaxed">{serverError}</p>
                  </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={
                    !selectedStudent ||
                    !selectedImage ||
                    isSubmitting ||
                    (selectedStudent?.faceRecognitionEnabled && !overwriteConfirmed)
                  }
                  onClick={handleSubmitRegistration}
                  className={`w-full py-4 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                    !selectedStudent || !selectedImage || (selectedStudent?.faceRecognitionEnabled && !overwriteConfirmed)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : isSubmitting
                      ? 'bg-sk-yellow-dark text-sk-navy cursor-wait'
                      : 'bg-sk-yellow text-sk-navy hover:bg-sk-yellow-dark hover:shadow-lg active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Validating & Registering Face...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-sk-navy" />
                      <span>
                        {selectedStudent?.faceRecognitionEnabled
                          ? 'Update Student Face Profile'
                          : 'Register Student Face'}
                      </span>
                    </>
                  )}
                </button>

                {!selectedStudent && (
                  <p className="text-center text-[11px] text-gray-400 mt-2">
                    Please select a student above to enable registration
                  </p>
                )}
                {selectedStudent && !selectedImage && (
                  <p className="text-center text-[11px] text-gray-400 mt-2">
                    Please choose or capture a photo to enable registration
                  </p>
                )}
                {selectedStudent?.faceRecognitionEnabled && !overwriteConfirmed && (
                  <p className="text-center text-[11px] text-amber-600 font-medium mt-2">
                    Please check the confirmation box above to permit overwriting
                  </p>
                )}
              </div>

            </div>

            {/* Instruction Checklist Card */}
            <div className="bg-white rounded-2xl border border-sk-border p-5 text-xs space-y-3">
              <h4 className="font-bold text-sk-navy flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sk-yellow-dark" /> Best Practices for Accurate Recognition
              </h4>
              <ul className="space-y-1.5 text-gray-600 list-disc pl-4 text-[11px]">
                <li>Student must look directly at the camera with a neutral face.</li>
                <li>Ensure uniform, clear lighting with no dark shadows or bright backlights.</li>
                <li>Remove sunglasses, heavy hats, or face masks.</li>
                <li>Only one student face must be in the photo frame.</li>
                <li>Supported formats: JPG, JPEG, PNG, WEBP (under 5MB).</li>
              </ul>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default FaceRegistration;
