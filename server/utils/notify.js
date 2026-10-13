import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const sendNotification = async ({ recipient, title, message, type, relatedId, link }) => {
  try {
    if (!recipient) return null;
    return await Notification.create({
      recipient,
      title,
      message,
      type,
      relatedId,
      link: link || ''
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

export const notifyAdmins = async ({ title, message, type, relatedId, link }) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      title,
      message,
      type,
      relatedId,
      link: link || ''
    }));
    if (notifications.length > 0) {
      return await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Failed to notify admins:', error.message);
  }
};
