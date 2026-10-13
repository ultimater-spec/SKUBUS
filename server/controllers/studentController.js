import Student from '../models/Student.js';

export const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate('parent', 'name email phone')
      .populate('assignedBus', 'busNumber')
      .populate('assignedRoute', 'routeName')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ status: true, message: "Students fetched successfully", data: students });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('parent', 'name email phone')
      .populate('assignedBus', 'busNumber')
      .populate('assignedRoute', 'routeName');
      
    if (!student) {
      return res.status(404).json({ status: false, message: "Student not found" });
    }
    res.status(200).json({ status: true, message: "Student fetched successfully", data: student });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ status: false, message: "Student ID already exists" });
    }
    
    const data = { ...req.body };
    if (!data.parent) delete data.parent;
    if (!data.assignedBus) delete data.assignedBus;
    if (!data.assignedRoute) delete data.assignedRoute;
    
    const student = await Student.create(data);
    res.status(201).json({ status: true, message: "Student created successfully", data: student });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.parent) delete data.parent;
    if (!data.assignedBus) delete data.assignedBus;
    if (!data.assignedRoute) delete data.assignedRoute;

    const student = await Student.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    
    if (!student) {
      return res.status(404).json({ status: false, message: "Student not found" });
    }
    res.status(200).json({ status: true, message: "Student updated successfully", data: student });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ status: false, message: "Student not found" });
    }
    res.status(200).json({ status: true, message: "Student deleted successfully", data: {} });
  } catch (error) {
    next(error);
  }
};

import axios from 'axios';

export const validateFace = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ status: false, message: "No image provided. Please select or capture a photo." });
    }

    // Type and format validation
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({ 
        status: false, 
        message: "Invalid image format. Must be a valid JPEG, PNG, or WebP base64 image." 
      });
    }

    // Max 5MB size validation on base64 data
    const base64Data = image.split(',')[1] || '';
    const approxBytes = (base64Data.length * 3) / 4;
    if (approxBytes > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        status: false, 
        message: "Image file size exceeds the 5MB maximum limit. Please choose a smaller photo." 
      });
    }

    const faceServiceUrl = process.env.FACE_SERVICE_URL || 'http://127.0.0.1:5001';
    try {
      // Forward to python microservice
      const pythonResponse = await axios.post(`${faceServiceUrl}/api/face/validate`, { image }, { timeout: 10000 });
      return res.status(200).json(pythonResponse.data);
    } catch (pyError) {
      if (pyError.response?.data) {
        return res.status(200).json(pyError.response.data);
      }
      return res.status(503).json({ 
        status: false, 
        message: "Face Recognition Service is unavailable. Please ensure the Python microservice is running on port 5001." 
      });
    }
  } catch (error) {
    next(error);
  }
};

export const registerFace = async (req, res, next) => {
  try {
    let { encodings, encoding, image } = req.body;

    // If an image is provided directly without pre-extracted encodings, extract via face service
    if (!encodings && !encoding && image) {
      if (typeof image !== 'string' || !image.startsWith('data:image/')) {
        return res.status(400).json({ 
          status: false, 
          message: "Invalid image format. Must be a valid JPEG, PNG, or WebP base64 image." 
        });
      }

      const base64Data = image.split(',')[1] || '';
      const approxBytes = (base64Data.length * 3) / 4;
      if (approxBytes > 5 * 1024 * 1024) {
        return res.status(400).json({ 
          status: false, 
          message: "Image file size exceeds the 5MB maximum limit." 
        });
      }

      const faceServiceUrl = process.env.FACE_SERVICE_URL || 'http://127.0.0.1:5001';
      try {
        const pythonResponse = await axios.post(`${faceServiceUrl}/api/face/validate`, { image }, { timeout: 10000 });
        if (!pythonResponse.data?.status || !pythonResponse.data?.data?.encoding) {
          return res.status(400).json({ 
            status: false, 
            message: pythonResponse.data?.message || "No valid face detected in the photo. Please align the student's face." 
          });
        }
        encoding = pythonResponse.data.data.encoding;
      } catch (pyError) {
        if (pyError.response?.data?.message) {
          return res.status(400).json({ status: false, message: pyError.response.data.message });
        }
        return res.status(503).json({ 
          status: false, 
          message: "Face Recognition Service is unavailable. Please ensure the Python microservice is running on port 5001." 
        });
      }
    }

    if (!encodings && !encoding) {
      return res.status(400).json({ status: false, message: "No face encodings or photo provided." });
    }

    let avgEncoding = [];
    if (encoding && Array.isArray(encoding)) {
      avgEncoding = encoding;
    } else if (encodings && Array.isArray(encodings) && encodings.length > 0) {
      const numFeatures = encodings[0].length;
      avgEncoding = new Array(numFeatures).fill(0);
      for (let enc of encodings) {
        for (let i = 0; i < numFeatures; i++) {
          avgEncoding[i] += enc[i];
        }
      }
      for (let i = 0; i < numFeatures; i++) {
        avgEncoding[i] /= encodings.length;
      }
    }

    if (!avgEncoding || avgEncoding.length === 0) {
      return res.status(400).json({ status: false, message: "Could not calculate face feature vectors." });
    }

    // Check for duplicate faces across OTHER students
    const allStudents = await Student.find({ faceRecognitionEnabled: true });
    for (let s of allStudents) {
      if (s._id.toString() === req.params.id) continue;
      if (!s.faceEncoding || !Array.isArray(s.faceEncoding)) continue;
      
      // Calculate euclidean distance
      let distance = 0;
      for (let i = 0; i < avgEncoding.length; i++) {
        distance += Math.pow(avgEncoding[i] - s.faceEncoding[i], 2);
      }
      distance = Math.sqrt(distance);
      
      // 0.6 is the standard threshold for dlib face_recognition
      if (distance < 0.6) {
        return res.status(400).json({ 
          status: false, 
          message: `Duplicate face detected. This face matches student: ${s.name} (${s.studentId})` 
        });
      }
    }

    const updateData = {
      faceRecognitionEnabled: true,
      faceEncoding: avgEncoding
    };

    if (image && typeof image === 'string' && image.startsWith('data:image/')) {
      updateData.profileImage = image;
    }

    const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!student) {
      return res.status(404).json({ status: false, message: "Student not found" });
    }
    
    res.status(200).json({ 
      status: true, 
      message: "Student face registered successfully", 
      data: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        registered: true
      }
    });
  } catch (error) {
    next(error);
  }
};
