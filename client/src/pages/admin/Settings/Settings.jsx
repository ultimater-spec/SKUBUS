import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, MapPin, Bus, Smartphone } from 'lucide-react';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import toast from 'react-hot-toast';

const Settings = () => {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">System Settings</h1>
          <p className="text-gray-500 font-medium">Configure global preferences.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-sk-navy">Security & Access</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sk-yellow"></div>
            </label>
          </div>
        </div>

        <div className="p-6 border-b border-t border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
            <Bell className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-sk-navy">Notification Preferences</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Email Alerts</p>
              <p className="text-sm text-gray-500">Send daily summary emails to admin</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sk-yellow"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">SMS Alerts for Parents</p>
              <p className="text-sm text-gray-500">Send SMS when student boards/drops</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sk-yellow"></div>
            </label>
          </div>
        </div>

        <div className="p-6 border-b border-t border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
            <Bus className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-sk-navy">Operations</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Default Speed Limit (km/h)</label>
            <input type="number" defaultValue={60} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Academic Year</label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
              <option>2023-2024</option>
              <option selected>2024-2025</option>
            </select>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex items-center justify-end">
          <PrimaryButton onClick={handleSave} className="px-8 py-2.5">
            Save Preferences
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default Settings;
