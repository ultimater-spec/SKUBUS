import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Bus, Users, ShieldAlert, MessageSquare, Briefcase, Bell, 
  Plus, Search, Filter, AlertCircle, Clock, Calendar, CheckCircle2,
  ChevronRight, Phone, MapPin, ArrowRight, UserCheck, RefreshCw, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

// Services
import { getMyParentProfile, getAssignedStaff } from '../services/parentService';
import { getComplaints } from '../services/complaintService';
import { getTickets } from '../services/ticketService';
import { getEnquiries } from '../services/enquiryService';
import { getNotifications } from '../services/notificationService';

// UI & Components
import StatusBadge from '../components/ui/StatusBadge';
import PrimaryButton from '../components/ui/PrimaryButton';
import RaiseComplaintModal from '../components/parent/RaiseComplaintModal';
import CreateTicketModal from '../components/parent/CreateTicketModal';
import SendEnquiryModal from '../components/parent/SendEnquiryModal';
import ConversationDrawer from '../components/parent/ConversationDrawer';
import AssignedStaffCard from '../components/parent/AssignedStaffCard';
import ParentNotifications from '../components/parent/ParentNotifications';

const ParentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  // Data State
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedStaffForEnquiry, setSelectedStaffForEnquiry] = useState('');
  
  // Conversation Drawer State
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerType, setDrawerType] = useState('complaint'); // 'complaint' | 'ticket' | 'enquiry'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [profRes, staffRes, compRes, tickRes, enqRes, notifRes] = await Promise.allSettled([
        getMyParentProfile(),
        getAssignedStaff(),
        getComplaints(),
        getTickets(),
        getEnquiries(),
        getNotifications()
      ]);

      if (profRes.status === 'fulfilled' && profRes.value?.status) {
        setProfile(profRes.value.data);
        setStudents(profRes.value.data.children || []);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value?.status) {
        setAssignedStaff(staffRes.value.data || []);
      }
      if (compRes.status === 'fulfilled' && compRes.value?.status) {
        setComplaints(compRes.value.data || []);
      }
      if (tickRes.status === 'fulfilled' && tickRes.value?.status) {
        setTickets(tickRes.value.data || []);
      }
      if (enqRes.status === 'fulfilled' && enqRes.value?.status) {
        setEnquiries(enqRes.value.data || []);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value?.status) {
        setNotifications(notifRes.value.data || []);
      }
    } catch (err) {
      toast.error('Failed to load parent portal data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Keep drawer data updated after a reply
  const refreshActiveItem = async () => {
    await fetchAllData();
    if (selectedItem) {
      if (drawerType === 'complaint') {
        const updated = complaints.find(c => c._id === selectedItem._id);
        if (updated) setSelectedItem(updated);
      } else if (drawerType === 'ticket') {
        const updated = tickets.find(t => t._id === selectedItem._id);
        if (updated) setSelectedItem(updated);
      } else if (drawerType === 'enquiry') {
        const updated = enquiries.find(e => e._id === selectedItem._id);
        if (updated) setSelectedItem(updated);
      }
    }
  };

  const handleOpenDrawer = (item, type) => {
    setSelectedItem(item);
    setDrawerType(type);
    setIsDrawerOpen(true);
  };

  const handleStartStaffEnquiry = (staffId) => {
    setSelectedStaffForEnquiry(staffId || '');
    setIsEnquiryModalOpen(true);
  };

  const handleNotificationSelect = (type, relatedId) => {
    if (type === 'complaint') {
      const c = complaints.find(item => item._id === relatedId);
      if (c) handleOpenDrawer(c, 'complaint');
      else setSearchParams({ tab: 'complaints' });
    } else if (type === 'ticket') {
      const t = tickets.find(item => item._id === relatedId);
      if (t) handleOpenDrawer(t, 'ticket');
      else setSearchParams({ tab: 'tickets' });
    } else if (type === 'enquiry') {
      const e = enquiries.find(item => item._id === relatedId);
      if (e) handleOpenDrawer(e, 'enquiry');
      else setSearchParams({ tab: 'staff' });
    }
  };

  // Filtered lists
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.complaintId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch = e.enquiryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pendingComplaintsCount = complaints.filter(c => ['pending', 'under_review', 'in_progress'].includes(c.status)).length;
  const openTicketsCount = tickets.filter(t => ['open', 'in_progress', 'waiting_for_parent'].includes(t.status)).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* 1. WELCOME & CHILD SUMMARY BANNER */}
      <div className="bg-gradient-to-r from-sk-navy via-sk-navy-light to-sk-navy text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-sk-yellow/10 -skew-x-12 translate-x-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sk-yellow/20 text-sk-yellow text-xs font-bold uppercase tracking-wider border border-sk-yellow/30">
              <Sparkles className="w-3.5 h-3.5" /> SKUBUS Parent Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name || 'Parent'} 👋
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Monitor your child's school bus transportation, reach out directly to assigned transport staff, and communicate with administration.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" /> Raise Complaint
            </button>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-4 py-2.5 bg-sk-yellow hover:bg-sk-yellow-dark text-sk-navy rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> New Ticket
            </button>
            <button
              onClick={() => handleStartStaffEnquiry()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" /> Staff Enquiry
            </button>
          </div>
        </div>

        {/* Children Quick Info Strip */}
        {students.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((student) => (
              <div 
                key={student._id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sk-yellow text-sk-navy flex items-center justify-center font-bold text-sm shadow-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{student.name}</p>
                    <p className="text-xs text-gray-300">{student.className ? `Class ${student.className}-${student.division || ''}` : student.studentId}</p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="font-bold text-sk-yellow block">
                    {student.assignedBus?.busNumber || 'Bus Unassigned'}
                  </span>
                  <span className="text-[11px] text-gray-300 truncate max-w-[120px] block" title={student.assignedRoute?.routeName}>
                    {student.assignedRoute?.routeName || 'Route Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Complaints Card */}
        <div 
          onClick={() => setSearchParams({ tab: 'complaints' })}
          className="bg-white p-5 rounded-2xl border border-sk-border shadow-sm hover:border-sk-yellow hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Complaints</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sk-navy">{complaints.length}</span>
            {pendingComplaintsCount > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                {pendingComplaintsCount} pending
              </span>
            )}
          </div>
        </div>

        {/* Tickets Card */}
        <div 
          onClick={() => setSearchParams({ tab: 'tickets' })}
          className="bg-white p-5 rounded-2xl border border-sk-border shadow-sm hover:border-sk-yellow hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Support Tickets</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sk-navy">{tickets.length}</span>
            {openTicketsCount > 0 && (
              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                {openTicketsCount} active
              </span>
            )}
          </div>
        </div>

        {/* Staff Enquiries Card */}
        <div 
          onClick={() => setSearchParams({ tab: 'staff' })}
          className="bg-white p-5 rounded-2xl border border-sk-border shadow-sm hover:border-sk-yellow hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Enquiries</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sk-navy">{enquiries.length}</span>
            <span className="text-xs text-gray-500">{assignedStaff.length} staff</span>
          </div>
        </div>

        {/* Notifications Card */}
        <div 
          onClick={() => setSearchParams({ tab: 'notifications' })}
          className="bg-white p-5 rounded-2xl border border-sk-border shadow-sm hover:border-sk-yellow hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notifications</span>
            <div className="w-9 h-9 rounded-xl bg-yellow-50 text-sk-yellow-dark flex items-center justify-center group-hover:scale-110 transition-transform relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sk-navy">{notifications.length}</span>
            {unreadCount > 0 && (
              <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

      </div>

      {/* 3. COMMUNICATION & SUPPORT MODULE TABS */}
      <div className="bg-white rounded-2xl border border-sk-border shadow-sm overflow-hidden">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 border-b border-sk-border overflow-x-auto scrollbar-none bg-gray-50/50">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: Bus },
              { id: 'complaints', label: `My Complaints (${complaints.length})`, icon: ShieldAlert },
              { id: 'tickets', label: `My Tickets (${tickets.length})`, icon: MessageSquare },
              { id: 'staff', label: `Contact Assigned Staff (${assignedStaff.length})`, icon: Briefcase },
              { id: 'notifications', label: `Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}`, icon: Bell },
              { id: 'children', label: `My Children (${students.length})`, icon: Users },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSearchParams({ tab: tab.id });
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className={`flex items-center gap-2 py-4 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    isActive 
                      ? 'border-sk-yellow-dark text-sk-navy bg-sk-yellow/10' 
                      : 'border-transparent text-gray-500 hover:text-sk-navy hover:bg-gray-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sk-yellow-dark' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button 
            onClick={fetchAllData}
            className="p-2 text-gray-400 hover:text-sk-navy hover:bg-white rounded-lg transition"
            title="Refresh portal data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-6">
          
          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Assigned Staff Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-sk-navy">Assigned Bus & Route Staff</h3>
                    <p className="text-xs text-gray-500">Contact the staff authorized for your student's daily commute.</p>
                  </div>
                  <button
                    onClick={() => setSearchParams({ tab: 'staff' })}
                    className="text-xs font-bold text-sk-navy hover:underline flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <AssignedStaffCard 
                  staffList={assignedStaff}
                  onSendEnquiry={handleStartStaffEnquiry}
                  onContactAdmin={() => setIsTicketModalOpen(true)}
                />
              </div>

              {/* Two Column Section: Recent Complaints & Support Tickets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                
                {/* Recent Complaints */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                      <h4 className="font-bold text-sk-navy text-sm">Recent Complaints</h4>
                    </div>
                    <button
                      onClick={() => setIsComplaintModalOpen(true)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Raise Complaint
                    </button>
                  </div>

                  {complaints.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      No complaints submitted. Everything is in order.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {complaints.slice(0, 3).map(c => (
                        <div 
                          key={c._id}
                          onClick={() => handleOpenDrawer(c, 'complaint')}
                          className="p-3 bg-white rounded-xl border border-gray-200/60 shadow-sm hover:border-sk-yellow cursor-pointer transition flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {c.complaintId}
                              </span>
                              <StatusBadge status={c.status} />
                            </div>
                            <p className="text-xs font-bold text-sk-navy truncate">{c.subject}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Tickets */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      <h4 className="font-bold text-sk-navy text-sm">Recent Support Tickets</h4>
                    </div>
                    <button
                      onClick={() => setIsTicketModalOpen(true)}
                      className="px-3 py-1.5 bg-sk-yellow hover:bg-sk-yellow-dark text-sk-navy rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Ticket
                    </button>
                  </div>

                  {tickets.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      No support tickets created. Need help? Open a new ticket anytime.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {tickets.slice(0, 3).map(t => (
                        <div 
                          key={t._id}
                          onClick={() => handleOpenDrawer(t, 'ticket')}
                          className="p-3 bg-white rounded-xl border border-gray-200/60 shadow-sm hover:border-sk-yellow cursor-pointer transition flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {t.ticketId}
                              </span>
                              <StatusBadge status={t.status} />
                            </div>
                            <p className="text-xs font-bold text-sk-navy truncate">{t.subject}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MY COMPLAINTS */}
          {currentTab === 'complaints' && (
            <div className="space-y-6">
              
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search complaints by ID or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-xs font-medium focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <PrimaryButton onClick={() => setIsComplaintModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Raise New Complaint
                </PrimaryButton>
              </div>

              {/* Complaints List Table */}
              <div className="border border-sk-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-sk-border text-gray-500 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Reference ID</th>
                      <th className="px-5 py-3.5">Complaint Title</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Related Student</th>
                      <th className="px-5 py-3.5">Priority</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-gray-400">
                          No complaints found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map(comp => (
                        <tr 
                          key={comp._id} 
                          onClick={() => handleOpenDrawer(comp, 'complaint')}
                          className="hover:bg-sk-yellow-background/30 cursor-pointer transition"
                        >
                          <td className="px-5 py-4 font-mono font-bold text-sk-navy">{comp.complaintId}</td>
                          <td className="px-5 py-4 font-bold text-sk-navy max-w-xs truncate" title={comp.subject}>{comp.subject}</td>
                          <td className="px-5 py-4 text-gray-600">{comp.category}</td>
                          <td className="px-5 py-4 text-gray-600">{comp.student?.name || 'General'}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              comp.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              comp.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {comp.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={comp.status} /></td>
                          <td className="px-5 py-4 text-gray-500">{new Date(comp.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-4 text-right">
                            <button className="px-3 py-1 bg-gray-100 hover:bg-sk-yellow text-sk-navy font-bold rounded-lg transition text-xs">
                              View Thread ({comp.messages?.length || 1})
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: MY TICKETS */}
          {currentTab === 'tickets' && (
            <div className="space-y-6">
              
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search support tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-xs font-medium focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_parent">Waiting for Parent</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <PrimaryButton onClick={() => setIsTicketModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Create New Ticket
                </PrimaryButton>
              </div>

              {/* Tickets List Table */}
              <div className="border border-sk-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-sk-border text-gray-500 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Ticket ID</th>
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Related Student</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-400">
                          No support tickets found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map(t => (
                        <tr 
                          key={t._id} 
                          onClick={() => handleOpenDrawer(t, 'ticket')}
                          className="hover:bg-sk-yellow-background/30 cursor-pointer transition"
                        >
                          <td className="px-5 py-4 font-mono font-bold text-sk-navy">{t.ticketId}</td>
                          <td className="px-5 py-4 font-bold text-sk-navy max-w-xs truncate" title={t.subject}>{t.subject}</td>
                          <td className="px-5 py-4 text-gray-600">{t.category}</td>
                          <td className="px-5 py-4 text-gray-600">{t.student?.name || 'General'}</td>
                          <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                          <td className="px-5 py-4 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-4 text-right">
                            <button className="px-3 py-1 bg-gray-100 hover:bg-sk-yellow text-sk-navy font-bold rounded-lg transition text-xs">
                              Open Chat ({t.messages?.length || 1})
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: CONTACT ASSIGNED STAFF & ENQUIRIES */}
          {currentTab === 'staff' && (
            <div className="space-y-8">
              
              {/* Staff Cards Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-sk-navy">Assigned Transport Staff</h3>
                    <p className="text-xs text-gray-500">
                      Direct contact options for drivers and attendants assigned to your student's bus fleet.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartStaffEnquiry()}
                    className="px-4 py-2 bg-sk-yellow hover:bg-sk-yellow-dark text-sk-navy font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Send Enquiry
                  </button>
                </div>

                <AssignedStaffCard 
                  staffList={assignedStaff}
                  onSendEnquiry={handleStartStaffEnquiry}
                  onContactAdmin={() => setIsTicketModalOpen(true)}
                />
              </div>

              {/* Staff Enquiries History Table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-sk-navy">Staff Enquiry History</h3>
                    <p className="text-xs text-gray-500">Track all messages sent to assigned staff, responses, and escalations.</p>
                  </div>
                </div>

                <div className="border border-sk-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-sk-border text-gray-500 uppercase font-bold text-[11px]">
                      <tr>
                        <th className="px-5 py-3.5">Enquiry ID</th>
                        <th className="px-5 py-3.5">Assigned Staff</th>
                        <th className="px-5 py-3.5">Subject</th>
                        <th className="px-5 py-3.5">Student</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Escalated?</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredEnquiries.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-gray-400">
                            No staff enquiries sent yet.
                          </td>
                        </tr>
                      ) : (
                        filteredEnquiries.map(enq => (
                          <tr 
                            key={enq._id} 
                            onClick={() => handleOpenDrawer(enq, 'enquiry')}
                            className="hover:bg-sk-yellow-background/30 cursor-pointer transition"
                          >
                            <td className="px-5 py-4 font-mono font-bold text-sk-navy">{enq.enquiryId}</td>
                            <td className="px-5 py-4 font-bold text-sk-navy">{enq.staff?.user?.name || 'Staff'}</td>
                            <td className="px-5 py-4 font-medium text-gray-800 max-w-xs truncate">{enq.subject}</td>
                            <td className="px-5 py-4 text-gray-600">{enq.student?.name || 'Child'}</td>
                            <td className="px-5 py-4"><StatusBadge status={enq.status} /></td>
                            <td className="px-5 py-4">
                              {enq.isEscalated ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                                  Escalated to Admin
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">No</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-gray-500">{new Date(enq.createdAt).toLocaleDateString()}</td>
                            <td className="px-5 py-4 text-right">
                              <button className="px-3 py-1 bg-gray-100 hover:bg-sk-yellow text-sk-navy font-bold rounded-lg transition text-xs">
                                View Conversation ({enq.messages?.length || 1})
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {currentTab === 'notifications' && (
            <ParentNotifications 
              notifications={notifications}
              onRefresh={fetchAllData}
              onSelectItem={handleNotificationSelect}
            />
          )}

          {/* TAB 6: MY CHILDREN */}
          {currentTab === 'children' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-sk-navy">Authorized Student Records</h3>
                  <p className="text-xs text-gray-500">Transportation and route assignments for your children.</p>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="p-12 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-sk-navy">No children linked to this parent account</p>
                  <p className="text-xs text-gray-500 mt-1">Please ask the school administrator to verify your student enrollment records.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {students.map(student => (
                    <div 
                      key={student._id}
                      className="bg-white rounded-2xl border border-sk-border p-6 shadow-sm hover:shadow-md transition space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-sk-navy text-sk-yellow flex items-center justify-center font-bold text-xl shadow-sm">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-sk-navy">{student.name}</h4>
                            <p className="text-xs text-gray-500 font-medium">
                              Student ID: <span className="font-mono font-bold text-sk-navy">{student.studentId}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.className ? `Class: ${student.className}-${student.division || ''}` : ''}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={student.status} />
                      </div>

                      {/* Transport Card */}
                      <div className="bg-sk-yellow-background/60 p-4 rounded-xl border border-sk-yellow/30 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-semibold flex items-center gap-1.5">
                            <Bus className="w-4 h-4 text-sk-navy" /> Assigned Bus:
                          </span>
                          <span className="font-bold text-sk-navy">
                            {student.assignedBus?.busNumber || 'None Assigned'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-semibold flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-sk-navy" /> Route:
                          </span>
                          <span className="font-bold text-sk-navy">
                            {student.assignedRoute?.routeName || 'None Assigned'}
                          </span>
                        </div>

                        {student.assignedBus?.driver?.user && (
                          <div className="flex items-center justify-between pt-2 border-t border-sk-yellow/30">
                            <span className="text-gray-600 font-semibold">Driver:</span>
                            <span className="font-bold text-sk-navy">{student.assignedBus.driver.user.name}</span>
                          </div>
                        )}

                        {student.assignedBus?.attendant?.user && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-semibold">Attendant:</span>
                            <span className="font-bold text-sk-navy">{student.assignedBus.attendant.user.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Route Stops if available */}
                      {student.assignedRoute?.stops && student.assignedRoute.stops.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-sk-navy mb-2">Scheduled Stops:</p>
                          <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                            {student.assignedRoute.stops.map(st => (
                              <div key={st._id} className="flex items-center justify-between text-[11px] p-1.5 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">{st.order}. {st.stopName}</span>
                                <span className="text-gray-500 font-mono">{st.pickupTime || '-'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSearchParams({ tab: 'complaints' });
                            setIsComplaintModalOpen(true);
                          }}
                          className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" /> Complaint for {student.name.split(' ')[0]}
                        </button>
                        <button
                          onClick={() => {
                            setSearchParams({ tab: 'staff' });
                          }}
                          className="flex-1 py-2 bg-sk-yellow hover:bg-sk-yellow-dark text-sk-navy rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                        >
                          <Briefcase className="w-3.5 h-3.5" /> Contact Staff
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* MODALS */}
      <RaiseComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        students={students}
        onSuccess={fetchAllData}
      />

      <CreateTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        students={students}
        onSuccess={fetchAllData}
      />

      <SendEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        assignedStaff={assignedStaff}
        students={students}
        initialStaffId={selectedStaffForEnquiry}
        onSuccess={fetchAllData}
      />

      <ConversationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedItem}
        type={drawerType}
        onRefresh={refreshActiveItem}
        currentUser={user}
      />

    </div>
  );
};

export default ParentDashboard;
