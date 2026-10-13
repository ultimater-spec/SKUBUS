import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Briefcase, Bus, ShieldAlert, CheckCircle, 
  Plus, Map, Calendar, ArrowRight, AlertCircle, Clock,
  Info, User, Bell, Camera
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { dashboardService } from '../services/dashboardService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalParents: 0,
    totalStaff: 0,
    activeBuses: 0,
    todayAttendance: '0%',
    totalComplaints: 0,
    pendingComplaints: 0,
    urgentComplaints: 0,
    totalTickets: 0,
    openTickets: 0,
    totalEnquiries: 0,
    escalatedEnquiries: 0,
    resolvedIssues: 0
  });
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [busData, setBusData] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getAttendanceOverview(),
        dashboardService.getRecentAttendance(),
        dashboardService.getRecentComplaints(),
        dashboardService.getNotifications(),
        dashboardService.getBusOverview()
      ]);
      
      const safeData = (result, fallback) => result.status === 'fulfilled' && result.value?.data ? result.value.data : fallback;

      setStats(safeData(results[0], {
        totalStudents: 0, totalParents: 0, totalStaff: 0, activeBuses: 0, todayAttendance: '0%',
        totalComplaints: 0, pendingComplaints: 0, urgentComplaints: 0,
        totalTickets: 0, openTickets: 0, totalEnquiries: 0, escalatedEnquiries: 0, resolvedIssues: 0
      }));
      setAttendanceData(safeData(results[1], []));
      setRecentAttendance(safeData(results[2], []));
      setRecentComplaints(safeData(results[3], []));
      setNotifications(safeData(results[4], []));
      setBusData(safeData(results[5], []));
      
    } catch (err) {
      console.error('Error in dashboard fetch process:', err);
      // We only show a complete error if EVERYTHING fails critically (not likely with allSettled)
      toast.error('Some dashboard data could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  const today = React.useMemo(() => new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }), []);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'CheckCircle': return CheckCircle;
      case 'AlertCircle': return AlertCircle;
      case 'Bus': return Bus;
      case 'Users': return Users;
      default: return Info;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-sk-border">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-sk-navy mb-2">{error}</h2>
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-2 bg-sk-navy text-white rounded-lg hover:bg-sk-navy-light transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">
            Good morning, {user?.name?.split(' ')[0] || 'Admin'} <span className="inline-block origin-bottom-right hover:animate-bounce">👋</span>
          </h1>
          <p className="text-gray-500 font-medium">Here's what's happening with SKUBUS today.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
          <Calendar className="w-5 h-5 text-sk-yellow-dark" />
          <span className="text-sm font-semibold text-sk-navy">{today}</span>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-sk-border p-4 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))
        ) : (
          <>
            <StatCard title="Total Students" value={stats.totalStudents.toString()} icon={Users} />
            <StatCard title="Total Parents" value={stats.totalParents.toString()} icon={UserCheck} />
            <StatCard title="Total Staff" value={stats.totalStaff.toString()} icon={Briefcase} />
            <StatCard title="Active Buses" value={stats.activeBuses.toString()} icon={Bus} />
            <StatCard title="Today's Attendance" value={stats.todayAttendance} icon={CheckCircle} />
            <StatCard title="Pending Complaints" value={stats.pendingComplaints.toString()} icon={ShieldAlert} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* MAIN COLUMN (Charts & Tables) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Section 1: Attendance Overview */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-sk-navy">Attendance Overview (Last 7 Days)</h2>
            </div>
            <div className="h-72 w-full">
              {loading ? (
                <div className="w-full h-full bg-gray-50 animate-pulse rounded-lg"></div>
              ) : attendanceData.length > 0 && attendanceData.some(d => d.present > 0 || d.absent > 0 || d.late > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="present" name="Present" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="late" name="Late" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4 text-gray-400">
                    <BarChart className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-sk-navy mb-1">No attendance data available yet.</h3>
                  <p className="text-xs text-gray-500">Wait for students to start marking attendance.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Bus Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
            <div className="p-6 border-b border-sk-border flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-sk-navy flex items-center gap-2">
                <Bus className="w-5 h-5 text-gray-400" /> Bus Fleet Overview
              </h2>
              <Link to="/admin/buses" className="text-sm font-medium text-sk-info hover:underline">Manage Buses</Link>
            </div>
            <div className="overflow-x-auto min-h-[150px]">
              {loading ? (
                <div className="p-6 space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : busData.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-sk-border">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Bus Number</th>
                      <th className="px-6 py-4 font-semibold">Driver/Staff</th>
                      <th className="px-6 py-4 font-semibold">Route</th>
                      <th className="px-6 py-4 font-semibold">Capacity</th>
                      <th className="px-6 py-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {busData.map((bus) => (
                      <tr key={bus.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-sk-navy">{bus.id}</td>
                        <td className="px-6 py-4 text-gray-600">{bus.driver}</td>
                        <td className="px-6 py-4 text-gray-600">{bus.route}</td>
                        <td className="px-6 py-4 text-gray-600">{bus.students}</td>
                        <td className="px-6 py-4 text-right flex justify-end">
                          <StatusBadge status={bus.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4 text-gray-400">
                    <Bus className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-sk-navy mb-1">No buses have been added yet.</h3>
                  <p className="text-xs text-gray-500 mb-4">Get started by creating a new bus profile.</p>
                  <Link to="/admin/buses" className="text-xs font-medium text-white bg-sk-navy px-4 py-2 rounded-lg hover:bg-sk-navy-light transition-colors">Add Bus</Link>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Recent Attendance */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
            <div className="p-6 border-b border-sk-border flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-sk-navy flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gray-400" /> Recent Attendance
              </h2>
              <Link to="/admin/attendance" className="text-sm font-medium text-sk-info hover:underline">View All Attendance</Link>
            </div>
            <div className="overflow-x-auto min-h-[150px]">
              {loading ? (
                 <div className="p-6 space-y-4">
                 {Array(3).fill(0).map((_, i) => (
                   <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
                 ))}
               </div>
              ) : recentAttendance.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-sk-border">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Student</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Time</th>
                      <th className="px-6 py-4 font-semibold">Bus</th>
                      <th className="px-6 py-4 font-semibold">Method</th>
                      <th className="px-6 py-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentAttendance.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-sk-navy">{record.name}</td>
                        <td className="px-6 py-4 text-gray-600">{record.date}</td>
                        <td className="px-6 py-4 text-gray-600">{record.time}</td>
                        <td className="px-6 py-4 text-gray-600">{record.bus}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{record.method}</td>
                        <td className="px-6 py-4 text-right flex justify-end">
                          <StatusBadge status={record.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4 text-gray-400">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-sk-navy mb-1">No attendance records available.</h3>
                  <p className="text-xs text-gray-500 mb-4">Attendance will appear here once recorded.</p>
                  <Link to="/admin/attendance" className="text-xs font-medium text-white bg-sk-navy px-4 py-2 rounded-lg hover:bg-sk-navy-light transition-colors">Go to Attendance</Link>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* SIDE COLUMN (Quick Actions, Notifications, Complaints) */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
            <h2 className="text-lg font-bold text-sk-navy mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/students" className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-sk-yellow hover:bg-sk-yellow-background transition-all group">
                <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5 text-gray-500 group-hover:text-sk-yellow-dark" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-sk-navy text-center">Add Student</span>
              </Link>
              <Link to="/admin/students" className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-sk-yellow hover:bg-sk-yellow-background transition-all group">
                <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-2">
                  <Camera className="w-5 h-5 text-gray-500 group-hover:text-sk-yellow-dark" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-sk-navy text-center">Register Face</span>
              </Link>
              <Link to="/admin/parents" className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-sk-yellow hover:bg-sk-yellow-background transition-all group">
                <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5 text-gray-500 group-hover:text-sk-yellow-dark" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-sk-navy text-center">Add Parent</span>
              </Link>
              <Link to="/admin/staff" className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-sk-yellow hover:bg-sk-yellow-background transition-all group">
                <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5 text-gray-500 group-hover:text-sk-yellow-dark" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-sk-navy text-center">Add Staff</span>
              </Link>
              <Link to="/admin/buses" className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-sk-yellow hover:bg-sk-yellow-background transition-all group">
                <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5 text-gray-500 group-hover:text-sk-yellow-dark" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-sk-navy text-center">Add Bus</span>
              </Link>
              <Link to="/admin/routes" className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-sk-yellow hover:bg-sk-yellow-background transition-all group">
                <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-2">
                  <Map className="w-5 h-5 text-gray-500 group-hover:text-sk-yellow-dark" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-sk-navy text-center">Create Route</span>
              </Link>
              <Link to="/admin/attendance" className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-sk-yellow hover:bg-sk-yellow-background transition-all group">
                <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-2">
                  <UserCheck className="w-5 h-5 text-gray-500 group-hover:text-sk-yellow-dark" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-sk-navy text-center">View Attendance</span>
              </Link>
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden flex flex-col max-h-96">
            <div className="p-5 border-b border-sk-border flex justify-between items-center bg-gray-50/50 shrink-0">
              <h2 className="text-lg font-bold text-sk-navy flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-400" /> Notifications
              </h2>
            </div>
            <div className="overflow-y-auto p-2 min-h-[100px]">
              {loading ? (
                <div className="space-y-3 p-3">
                  <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((note) => {
                  const Icon = getIcon(note.iconName);
                  return (
                    <div key={note.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                      <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${note.bg} ${note.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${note.isRead ? 'text-gray-600' : 'text-gray-900'} leading-snug`}>
                          {note.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {note.time}
                        </p>
                      </div>
                      {!note.isRead && (
                        <div className="w-2 h-2 rounded-full bg-sk-yellow-dark mt-1.5 shrink-0 animate-pulse"></div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Bell className="w-6 h-6 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No new notifications.</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-sk-border text-center shrink-0">
              <Link to="/admin/notifications" className="text-sm font-medium text-sk-info hover:underline flex items-center justify-center gap-1">
                View all notifications <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Communication & Support Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden flex flex-col">
            <div className="p-5 border-b border-sk-border flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-sk-navy flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-sk-yellow-dark" /> Communication & Support
              </h2>
              <Link to="/admin/complaints" className="text-xs font-bold text-sk-navy hover:underline">
                Open Center →
              </Link>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-1 p-3 bg-gray-50 border-b border-gray-100 text-center text-xs">
              <Link to="/admin/complaints?tab=complaints" className="p-2 rounded-xl hover:bg-white transition">
                <span className="font-extrabold text-sk-navy block text-base">{stats.totalComplaints || 0}</span>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">Complaints</span>
                {stats.pendingComplaints > 0 && (
                  <span className="inline-block mt-0.5 text-[9px] font-bold text-red-600 bg-red-100 px-1 rounded">
                    {stats.pendingComplaints} pend
                  </span>
                )}
              </Link>

              <Link to="/admin/complaints?tab=tickets" className="p-2 rounded-xl hover:bg-white transition">
                <span className="font-extrabold text-sk-navy block text-base">{stats.totalTickets || 0}</span>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">Tickets</span>
                {stats.openTickets > 0 && (
                  <span className="inline-block mt-0.5 text-[9px] font-bold text-blue-600 bg-blue-100 px-1 rounded">
                    {stats.openTickets} open
                  </span>
                )}
              </Link>

              <Link to="/admin/complaints?tab=enquiries" className="p-2 rounded-xl hover:bg-white transition">
                <span className="font-extrabold text-sk-navy block text-base">{stats.totalEnquiries || 0}</span>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">Enquiries</span>
                {stats.escalatedEnquiries > 0 && (
                  <span className="inline-block mt-0.5 text-[9px] font-bold text-red-600 bg-red-100 px-1 rounded animate-pulse">
                    {stats.escalatedEnquiries} esc
                  </span>
                )}
              </Link>
            </div>

            {/* Urgent Alert Banner */}
            {stats.urgentComplaints > 0 && (
              <div className="m-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" /> {stats.urgentComplaints} Urgent Complaint(s) Pending!
                </span>
                <Link to="/admin/complaints?tab=complaints" className="text-[11px] underline text-red-700">
                  Review
                </Link>
              </div>
            )}

            {/* Recent Complaints List */}
            <div className="p-2 min-h-[100px]">
              {loading ? (
                <div className="space-y-3 p-3">
                  <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ) : recentComplaints.length > 0 ? (
                recentComplaints.map((comp) => (
                  <Link 
                    key={comp.id} 
                    to="/admin/complaints?tab=complaints"
                    className="p-3.5 hover:bg-gray-50 rounded-xl transition-colors border-b last:border-0 border-gray-100 block group"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="text-xs font-bold text-sk-navy group-hover:text-sk-yellow-dark transition truncate max-w-[200px]">
                        {comp.subject}
                      </p>
                      <StatusBadge status={comp.status} />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-gray-500">
                      <span className="flex items-center gap-1"><User className="w-3 h-3"/> {comp.parent}</span>
                      <span>{comp.date}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="bg-gray-50 p-2.5 rounded-full mb-2 text-gray-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-semibold text-sk-navy mb-0.5">No complaints received yet.</h3>
                  <p className="text-[11px] text-gray-500">All parent communication is clear.</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-sk-border text-center shrink-0 flex items-center justify-between text-xs px-4">
              <span className="text-gray-500 font-medium">
                Resolved: <strong className="text-emerald-600">{stats.resolvedIssues || 0}</strong>
              </span>
              <Link to="/admin/complaints" className="font-bold text-sk-navy hover:underline flex items-center gap-1">
                Manage all issues <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
