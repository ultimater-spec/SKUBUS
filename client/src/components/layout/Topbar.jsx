import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Search, ChevronDown, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';

const Topbar = ({ onMenuClick }) => {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifs = async () => {
    try {
      const res = await getNotifications();
      if (res?.status) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || (res.data || []).filter(n => !n.isRead).length);
      }
    } catch (err) {
      // ignore silently in topbar
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 30s
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markAsRead(notif._id);
        fetchNotifs();
      }
      setShowNotifications(false);
      
      if (user?.role === 'parent') {
        if (notif.type === 'complaint') navigate('/parent/dashboard?tab=complaints');
        else if (notif.type === 'ticket') navigate('/parent/dashboard?tab=tickets');
        else if (notif.type === 'enquiry') navigate('/parent/dashboard?tab=staff');
        else navigate('/parent/dashboard?tab=notifications');
      } else if (user?.role === 'admin') {
        if (['complaint', 'ticket', 'enquiry'].includes(notif.type)) {
          navigate(`/admin/complaints?tab=${notif.type === 'complaint' ? 'complaints' : notif.type === 'ticket' ? 'tickets' : 'enquiries'}`);
        } else {
          navigate('/admin/notifications');
        }
      } else if (user?.role === 'staff') {
        navigate('/staff/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  // Simple breadcrumb logic based on path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle = pathParts.length > 1 
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1) 
    : 'Dashboard';

  return (
    <header className="bg-white border-b border-sk-border h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 sticky top-0 shadow-sm">
      <div className="flex items-center flex-1">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 mr-2 text-gray-500 hover:text-sk-navy focus:outline-none transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden sm:flex flex-col">
          <h1 className="text-lg font-bold text-sk-navy leading-tight">{pageTitle}</h1>
          <nav className="flex text-xs text-gray-500 font-medium">
            <span>SKUBUS</span>
            <span className="mx-1.5 text-gray-300">/</span>
            <span className="capitalize">{pathParts[0]}</span>
            <span className="mx-1.5 text-gray-300">/</span>
            <span className="capitalize text-sk-navy">{pageTitle}</span>
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-sk-yellow focus:bg-white transition-all w-48 lg:w-64"
          />
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-400 hover:text-sk-navy relative transition-colors rounded-xl hover:bg-gray-100"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-red-500 rounded-full ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-sk-border z-50 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-3.5 bg-gray-50 border-b border-sk-border flex items-center justify-between">
                <span className="text-xs font-bold text-sk-navy uppercase tracking-wider">
                  Notifications ({unreadCount} new)
                </span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-sk-navy hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 text-xs">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div 
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 hover:bg-gray-50 cursor-pointer transition flex items-start gap-3 ${
                        !n.isRead ? 'bg-sk-yellow-background/40' : 'bg-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold ${!n.isRead ? 'text-sk-navy' : 'text-gray-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-gray-500 text-[11px] line-clamp-2 mt-0.5">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-sk-yellow-dark shrink-0 mt-1"></span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-gray-50 border-t border-sk-border text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    if (user?.role === 'parent') navigate('/parent/dashboard?tab=notifications');
                    else if (user?.role === 'admin') navigate('/admin/notifications');
                    else navigate('/staff/dashboard');
                  }}
                  className="text-xs font-bold text-sk-navy hover:underline"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-3 sm:pl-5 border-l border-sk-border cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-sk-navy text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-sk-navy leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role === 'admin' ? 'Admin' : user?.role}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
