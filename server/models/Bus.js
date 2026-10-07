import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  attendant: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  model: { type: String },
  year: { type: Number },
  insuranceExpiry: { type: Date },
  fitnessExpiry: { type: Date },
}, { timestamps: true });

export default mongoose.model('Bus', busSchema);
