import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bus, Home, Users, UserCheck, ShieldAlert, LogOut, X, Camera, 
  Map, Bell, BarChart3, Settings, Briefcase, MessageSquare
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const adminLinks = [
    { type: 'header', name: 'OVERVIEW' },
    { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
    
    { type: 'header', name: 'MANAGEMENT' },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Parents', path: '/admin/parents', icon: Users },
    { name: 'Staff', path: '/admin/staff', icon: Briefcase },
    { name: 'Buses', path: '/admin/buses', icon: Bus },
    { name: 'Routes', path: '/admin/routes', icon: Map },
    
    { type: 'header', name: 'OPERATIONS' },
    { name: 'Attendance', path: '/admin/attendance', icon: UserCheck },
    { name: 'Complaints', path: '/admin/complaints', icon: ShieldAlert },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    
    { type: 'header', name: 'ANALYTICS' },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    
    { type: 'header', name: 'SYSTEM' },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const parentLinks = [
    { type: 'header', name: 'OVERVIEW' },
    { name: 'Dashboard', path: '/parent/dashboard', icon: Home },
    { name: 'My Children', path: '/parent/dashboard?tab=children', icon: Users },
    
    { type: 'header', name: 'COMMUNICATION' },
    { name: 'Complaints', path: '/parent/dashboard?tab=complaints', icon: ShieldAlert },
    { name: 'Support Tickets', path: '/parent/dashboard?tab=tickets', icon: MessageSquare },
    { name: 'Staff Enquiry', path: '/parent/dashboard?tab=staff', icon: Briefcase },
    { name: 'Notifications', path: '/parent/dashboard?tab=notifications', icon: Bell },
  ];

  const staffLinks = [
    { type: 'header', name: 'OVERVIEW' },
    { name: 'Dashboard', path: '/staff/dashboard', icon: Home },
    { name: 'Scanner', path: '/staff/scanner', icon: Camera },
  ];

  let links = [];
  if (user?.role === 'admin') links = adminLinks;
  else if (user?.role === 'parent') links = parentLinks;
  else if (user?.role === 'staff') links = staffLinks;

  const handleLogout = () => {
    dispatch(logout());
  };

  const isLinkActive = (path) => {
    if (path.includes('?')) {
      return `${location.pathname}${location.search}` === path;
    }
    return location.pathname === path && !location.search;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-sk-navy/80 backdrop-blur-sm md:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar component */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sk-navy text-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-5 shrink-0 border-b border-sk-navy-light/50 bg-sk-navy">
          <div className="flex items-center gap-3">
            <div className="bg-sk-yellow p-1.5 rounded-lg">
              <Bus className="w-6 h-6 text-sk-navy" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wide leading-none block">SKUBUS</span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">School Bus Management</span>
            </div>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <nav className="px-3 space-y-1">
            {links.map((link, index) => {
              if (link.type === 'header') {
                return (
                  <div key={`header-${index}`} className="px-3 pt-4 pb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {link.name}
                    </span>
                  </div>
                );
              }

              const isActive = isLinkActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-sk-yellow text-sk-navy shadow-[0_0_15px_rgba(250,204,21,0.15)]' 
                      : 'text-gray-400 hover:bg-sk-navy-light/50 hover:text-white'
                  }`}
                >
                  <Icon className={`mr-3 shrink-0 h-5 w-5 transition-colors ${isActive ? 'text-sk-navy' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 p-4 border-t border-sk-navy-light bg-sk-navy-light/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-sk-yellow text-sk-navy flex items-center justify-center font-bold text-lg shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.role === 'admin' ? 'Administrator' : user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group flex w-full justify-center items-center px-4 py-2 text-sm font-medium rounded-lg text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="mr-2 shrink-0 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
