import React, { useState } from 'react';
import { 
  BarChart2, TrendingUp, Users, Bus, Map, FileText, Download, Calendar, Filter 
} from 'lucide-react';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const Reports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('this_month');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Reports & Analytics</h1>
          <p className="text-gray-500 font-medium">Generate and view system reports.</p>
        </div>
        <PrimaryButton className="shrink-0 flex items-center gap-2">
          <Download className="w-5 h-5" /> Export Report
        </PrimaryButton>
      </div>

      {/* CONTROLS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-sk-border flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sk-yellow bg-gray-50"
          >
            <option value="attendance">Attendance Report</option>
            <option value="bus_utilization">Bus Utilization</option>
            <option value="route_efficiency">Route Efficiency</option>
            <option value="complaints">Complaints Summary</option>
          </select>
        </div>
        
        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sk-yellow bg-gray-50"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_term">This Term</option>
          </select>
        </div>
      </div>

      {/* DASHBOARD PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-600">Total Students</h3>
          </div>
          <p className="text-3xl font-bold text-sk-navy mb-1">1,248</p>
          <p className="text-sm text-green-500 flex items-center gap-1 font-medium">
            <TrendingUp className="w-4 h-4" /> +2.5% vs last month
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-600">Avg. Attendance</h3>
          </div>
          <p className="text-3xl font-bold text-sk-navy mb-1">94.2%</p>
          <p className="text-sm text-green-500 flex items-center gap-1 font-medium">
            <TrendingUp className="w-4 h-4" /> +0.8% vs last month
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Bus className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-600">Active Buses</h3>
          </div>
          <p className="text-3xl font-bold text-sk-navy mb-1">24 / 26</p>
          <p className="text-sm text-gray-500 font-medium">2 in maintenance</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-600">New Complaints</h3>
          </div>
          <p className="text-3xl font-bold text-sk-navy mb-1">12</p>
          <p className="text-sm text-red-500 flex items-center gap-1 font-medium">
            <TrendingUp className="w-4 h-4" /> +4 vs last month
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sk-border p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-gray-50 p-6 rounded-full mb-4 text-gray-400">
          <BarChart2 className="w-12 h-12" />
        </div>
        <h3 className="text-xl font-bold text-sk-navy mb-2">Report Generation</h3>
        <p className="text-gray-500 max-w-md text-center mb-6">
          Advanced reporting and analytics visualization will be available in the next system update. Currently, you can export the raw data.
        </p>
        <PrimaryButton className="flex items-center gap-2">
          <Download className="w-5 h-5" /> Export Data (CSV)
        </PrimaryButton>
      </div>

    </div>
  );
};

// Mock icon imports for preview card
const CheckCircle = ({className}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const AlertTriangle = ({className}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>;

export default Reports;
