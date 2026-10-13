import mongoose from 'mongoose';

const staffEnquirySchema = new mongoose.Schema({
  enquiryId: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  subject: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Bus Timing', 'Route Timing', 'Pickup / Dropoff', 'Lost Item', 'Student Conduct', 'Health / Safety', 'General Enquiry', 'Other'],
    default: 'General Enquiry'
  },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['new', 'replied', 'in_progress', 'resolved'], 
    default: 'new' 
  },
  isEscalated: { type: Boolean, default: false },
  escalatedAt: { type: Date },
  escalationReason: { type: String },
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  internalNotes: { type: String },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String },
    senderRole: { type: String, enum: ['admin', 'parent', 'staff'] },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('StaffEnquiry', staffEnquirySchema);
