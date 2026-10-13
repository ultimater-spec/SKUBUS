import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['attendance', 'complaint', 'ticket', 'enquiry', 'system', 'bus', 'route'], 
    required: true 
  },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  link: { type: String }, // In-app navigation URL (e.g. /parent/dashboard?tab=complaints)
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
