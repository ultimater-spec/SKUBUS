import React from 'react';
import { 
  Bell, Check, Trash2, Clock, CheckCheck, 
  MessageSquare, AlertCircle, Bus, ShieldAlert, ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { markAsRead, markAllAsRead, deleteNotification } from '../../services/notificationService';

const ParentNotifications = ({ notifications = [], onRefresh, onSelectItem }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success('Notification removed');
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'complaint':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'ticket':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'enquiry':
        return <MessageSquare className="w-5 h-5 text-amber-500" />;
      case 'bus':
        return <Bus className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-sk-navy" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-sk-border shadow-sm overflow-hidden">
      
      {/* Notifications Header */}
      <div className="p-5 border-b border-sk-border bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sk-yellow-background border border-sk-yellow/40 flex items-center justify-center text-sk-navy">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sk-navy text-lg">Notifications</h3>
            <p className="text-xs text-gray-500">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You are all caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 shadow-sm transition"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" /> Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-300 mx-auto flex items-center justify-center mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-sk-navy">No notifications found</p>
            <p className="text-xs text-gray-500 mt-1">Updates regarding your complaints, tickets, and enquiries will appear here.</p>
          </div>
        ) : (
          notifications.map((note) => (
            <div 
              key={note._id}
              className={`p-4 transition-colors flex items-start gap-3.5 hover:bg-gray-50/80 ${
                !note.isRead ? 'bg-sk-yellow-background/40' : 'bg-white'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-sm border border-gray-100 shrink-0 mt-0.5">
                {getIcon(note.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm font-bold ${!note.isRead ? 'text-sk-navy' : 'text-gray-700'}`}>
                    {note.title}
                  </h4>
                  {!note.isRead && (
                    <span className="w-2 h-2 rounded-full bg-sk-yellow-dark shrink-0"></span>
                  )}
                  <span className="text-[11px] text-gray-400 ml-auto shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  {note.message}
                </p>

                <div className="flex items-center gap-2">
                  {!note.isRead && (
                    <button
                      onClick={() => handleMarkRead(note._id)}
                      className="text-[11px] text-gray-500 hover:text-sk-navy font-semibold flex items-center gap-1 py-1 px-2 rounded hover:bg-gray-100 transition"
                    >
                      <Check className="w-3 h-3 text-emerald-600" /> Mark read
                    </button>
                  )}
                  {note.relatedId && onSelectItem && (
                    <button
                      onClick={() => {
                        handleMarkRead(note._id);
                        onSelectItem(note.type, note.relatedId);
                      }}
                      className="text-[11px] text-sk-navy font-bold hover:underline flex items-center gap-1 py-1 px-2 rounded hover:bg-sk-yellow-light/50 transition ml-auto"
                    >
                      View details <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-[11px] text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ParentNotifications;
