import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Bus', 'Driver', 'Staff', 'Route', 'Student Safety', 'Attendance', 'Other'],
    default: 'Other'
  },
  priority: { 
    type: String, 
    enum: ['normal', 'high', 'urgent', 'low', 'medium'], 
    default: 'normal' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'], 
    default: 'pending' 
  },
  attachment: { type: String }, // Optional image base64 data URL
  adminReply: { type: String },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  repliedAt: { type: Date },
  resolutionNotes: { type: String },
  internalNotes: { type: String }, // Strictly visible only to administrators
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String },
    senderRole: { type: String, enum: ['admin', 'parent', 'staff'] },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
