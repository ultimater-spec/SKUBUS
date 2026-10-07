import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, required: true },
  time: { type: String },
  type: { type: String, enum: ['boarding', 'dropoff'], required: true },
  method: { type: String, enum: ['face_recognition', 'manual'], required: true },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  confidence: { type: Number },
  remarks: { type: String },
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
