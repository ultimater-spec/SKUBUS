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
      return res.status(400).json({ status: false, message: "No image provided" });
    }

    try {
      // Forward to python microservice
      const pythonResponse = await axios.post('http://127.0.0.1:5001/api/face/validate', { image });
      return res.status(200).json(pythonResponse.data);
    } catch (pyError) {
      if (pyError.response) {
        return res.status(200).json(pyError.response.data);
      }
      return res.status(503).json({ status: false, message: "Face Recognition Service is unavailable" });
    }
  } catch (error) {
    next(error);
  }
};

export const registerFace = async (req, res, next) => {
  try {
    const { encodings } = req.body;
    if (!encodings || encodings.length === 0) {
      return res.status(400).json({ status: false, message: "No face encodings provided" });
    }

    // Average the 5 encodings for better accuracy
    let avgEncoding = [];
    if (encodings.length > 0) {
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

    // Check for duplicate faces
    const allStudents = await Student.find({ faceRecognitionEnabled: true });
    for (let s of allStudents) {
      if (s._id.toString() === req.params.id) continue;
      
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

    const student = await Student.findByIdAndUpdate(req.params.id, {
      faceRecognitionEnabled: true,
      faceEncoding: avgEncoding
    }, { new: true });
    
    if (!student) {
      return res.status(404).json({ status: false, message: "Student not found" });
    }
    
    res.status(200).json({ 
      status: true, 
      message: "Student face registered successfully", 
      data: {
        studentId: student.studentId,
        registered: true
      }
    });
  } catch (error) {
    next(error);
  }
};
