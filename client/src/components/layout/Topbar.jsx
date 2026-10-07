import React from 'react';
import { Menu, Bell, User, Search, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const Topbar = ({ onMenuClick }) => {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();

  // Simple breadcrumb logic based on path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle = pathParts.length > 1 
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1) 
    : 'Dashboard';

  return (
    <header className="bg-white border-b border-sk-border h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0 shadow-sm">
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

        <button className="p-2 text-gray-400 hover:text-sk-navy relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-sk-error ring-2 ring-white animate-pulse"></span>
        </button>

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
