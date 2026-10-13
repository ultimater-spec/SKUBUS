import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  subject: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['General', 'Bus Tracking', 'Fee / Billing', 'Billing', 'Schedule', 'Student Safety', 'Attendance', 'Other'],
    default: 'General'
  },
  description: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['normal', 'high', 'urgent'], 
    default: 'normal' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'waiting_for_parent', 'resolved', 'closed'], 
    default: 'open' 
  },
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  internalNotes: { type: String }, // Visible only to admins
  closedAt: { type: Date },
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String },
    senderRole: { type: String, enum: ['admin', 'parent', 'staff'] },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);
