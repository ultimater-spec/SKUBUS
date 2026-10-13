import Notification from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 });
      
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.status(200).json({ status: true, message: "Notifications fetched successfully", data: notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { returnDocument: 'after' }
    );
    
    if (!notification) {
      return res.status(404).json({ status: false, message: "Notification not found" });
    }
    
    res.status(200).json({ status: true, message: "Notification marked as read", data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ status: true, message: "All notifications marked as read", data: {} });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ status: true, message: "Notification created successfully", data: notification });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    
    if (!notification) {
      return res.status(404).json({ status: false, message: "Notification not found" });
    }
    
    res.status(200).json({ status: true, message: "Notification deleted successfully", data: {} });
  } catch (error) {
    next(error);
  }
};
