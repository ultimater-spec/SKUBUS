import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  className: { type: String },
  division: { type: String },
  rollNumber: { type: String },
  admissionNumber: { type: String },
  profileImage: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  emergencyContact: { type: String },
  address: { type: String },
  faceRecognitionEnabled: { type: Boolean, default: false },
  faceEncoding: { type: mongoose.Schema.Types.Mixed }, // Stores array of floats or buffer
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
