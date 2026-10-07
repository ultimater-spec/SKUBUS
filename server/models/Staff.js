import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  staffId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String },
  designation: { type: String },
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  joiningDate: { type: Date },
  emergencyContact: { type: String },
  address: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Staff', staffSchema);
