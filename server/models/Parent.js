import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema({
  parentId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relationship: { type: String },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  address: { type: String },
  emergencyContact: { type: String },
}, { timestamps: true });

export default mongoose.model('Parent', parentSchema);
