import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, ShieldCheck, Bus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../../services/notificationService';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res.status) {
        setNotifications(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      }
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await markAsRead(id);
      if (res.status) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllAsRead();
      if (res.status) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notification?')) {
      try {
        const res = await deleteNotification(id);
        if (res.status) {
          setNotifications(notifications.filter(n => n._id !== id));
        }
      } catch (error) {
        toast.error('Failed to delete notification');
      }
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'attendance': return <ShieldCheck className="w-5 h-5 text-green-500" />;
      case 'complaint': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'bus': return <Bus className="w-5 h-5 text-blue-500" />;
      case 'route': return <MapPin className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Notifications</h1>
          <p className="text-gray-500 font-medium">You have {unreadCount} unread messages.</p>
        </div>
        {unreadCount > 0 && (
          <PrimaryButton onClick={handleMarkAllAsRead} className="shrink-0 flex items-center gap-2">
            <Check className="w-4 h-4" /> Mark All as Read
          </PrimaryButton>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-5 transition-colors flex gap-4 ${notif.isRead ? 'bg-white' : 'bg-blue-50/30'}`}
              >
                <div className="shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                    {getIcon(notif.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold text-sm sm:text-base truncate ${notif.isRead ? 'text-gray-700' : 'text-sk-navy'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                    {notif.message}
                  </p>
                </div>
                
                <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg tooltip" 
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(notif._id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg tooltip" 
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="bg-gray-50 p-6 rounded-full mb-4 text-gray-400">
              <Bell className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-sk-navy mb-2">No notifications yet</h3>
            <p className="text-gray-500 max-w-sm">When you get updates about attendance, complaints, or system alerts, they'll show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
