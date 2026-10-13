import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, AlertCircle, MessageSquare, Briefcase, CheckCircle, 
  Clock, Trash2, Eye, Filter, ArrowUpRight, ShieldAlert,
  AlertTriangle, Lock, Send, User, ChevronRight, X, Phone, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

// Services
import { getComplaints, updateComplaint, deleteComplaint, addComplaintMessage } from '../../../services/complaintService';
import { getTickets, updateTicketStatus, replyTicket } from '../../../services/ticketService';
import { getEnquiries, updateEnquiryStatus, replyEnquiry } from '../../../services/enquiryService';

// UI
import StatusBadge from '../../../components/ui/StatusBadge';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const ComplaintList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'complaints'; // 'complaints' | 'tickets' | 'enquiries'

  // Data States
  const [complaints, setComplaints] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Detail & Management Drawer
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState('complaint');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [internalNotesText, setInternalNotesText] = useState('');
  const [resolutionNotesText, setResolutionNotesText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const fetchAllCommunications = useCallback(async () => {
    try {
      setLoading(true);
      const [compRes, tickRes, enqRes] = await Promise.allSettled([
        getComplaints(),
        getTickets(),
        getEnquiries()
      ]);

      if (compRes.status === 'fulfilled' && compRes.value?.status) {
        setComplaints(compRes.value.data || []);
      }
      if (tickRes.status === 'fulfilled' && tickRes.value?.status) {
        setTickets(tickRes.value.data || []);
      }
      if (enqRes.status === 'fulfilled' && enqRes.value?.status) {
        setEnquiries(enqRes.value.data || []);
      }
    } catch (error) {
      toast.error('Failed to load communication records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCommunications();
  }, [fetchAllCommunications]);

  const handleOpenDrawer = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
    setNewStatus(item.status);
    setInternalNotesText(item.internalNotes || '');
    setResolutionNotesText(item.resolutionNotes || '');
    setReplyText('');
    setIsDrawerOpen(true);
  };

  const handleDeleteComplaint = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      const res = await deleteComplaint(id);
      if (res.status) {
        toast.success('Complaint deleted');
        setComplaints(complaints.filter(c => c._id !== id));
        if (selectedItem?._id === id) setIsDrawerOpen(false);
      }
    } catch (error) {
      toast.error('Failed to delete complaint');
    }
  };

  const handleQuickStatusUpdate = async (id, type, status, e) => {
    if (e) e.stopPropagation();
    try {
      if (type === 'complaint') {
        await updateComplaint(id, { status });
      } else if (type === 'ticket') {
        await updateTicketStatus(id, { status });
      } else if (type === 'enquiry') {
        await updateEnquiryStatus(id, { status });
      }
      toast.success(`Marked as ${status.replace('_', ' ')}`);
      fetchAllCommunications();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveDrawerActions = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmittingAction(true);
    try {
      if (selectedType === 'complaint') {
        const payload = {
          status: newStatus,
          internalNotes: internalNotesText,
          resolutionNotes: resolutionNotesText
        };
        if (replyText.trim()) {
          payload.adminReply = replyText.trim();
        }
        await updateComplaint(selectedItem._id, payload);
        toast.success('Complaint updated and reply sent to parent');
      } else if (selectedType === 'ticket') {
        if (replyText.trim()) {
          await replyTicket(selectedItem._id, { message: replyText.trim() });
        }
        await updateTicketStatus(selectedItem._id, { 
          status: newStatus, 
          internalNotes: internalNotesText 
        });
        toast.success('Ticket updated and reply sent to parent');
      } else if (selectedType === 'enquiry') {
        if (replyText.trim()) {
          await replyEnquiry(selectedItem._id, { message: replyText.trim() });
        }
        await updateEnquiryStatus(selectedItem._id, { 
          status: newStatus, 
          internalNotes: internalNotesText 
        });
        toast.success('Enquiry updated successfully');
      }

      await fetchAllCommunications();
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update record');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Urgent items needing immediate admin intervention
  const urgentComplaints = complaints.filter(c => c.priority === 'urgent' && c.status !== 'resolved');
  const escalatedEnquiries = enquiries.filter(e => e.isEscalated && e.status !== 'resolved');

  // Filtered complaints
  const filteredComplaints = complaints.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = c.complaintId?.toLowerCase().includes(term) ||
                          c.subject?.toLowerCase().includes(term) ||
                          c.user?.name?.toLowerCase().includes(term) ||
                          c.student?.name?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = t.ticketId?.toLowerCase().includes(term) ||
                          t.subject?.toLowerCase().includes(term) ||
                          t.parent?.name?.toLowerCase().includes(term) ||
                          t.student?.name?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter(e => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = e.enquiryId?.toLowerCase().includes(term) ||
                          e.subject?.toLowerCase().includes(term) ||
                          e.parent?.name?.toLowerCase().includes(term) ||
                          e.staff?.user?.name?.toLowerCase().includes(term) ||
                          e.student?.name?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Communication & Support Center</h1>
          <p className="text-gray-500 font-medium text-xs sm:text-sm">
            Unified management for parent complaints, administrative support tickets, and staff enquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllCommunications}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            title="Refresh communications"
          >
            <Clock className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* URGENT ALERTS BANNER (If any urgent issues exist) */}
      {(urgentComplaints.length > 0 || escalatedEnquiries.length > 0) && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-950">Immediate Action Required</h3>
              <p className="text-xs text-red-800">
                {urgentComplaints.length > 0 && `${urgentComplaints.length} Urgent Complaint(s)`}
                {urgentComplaints.length > 0 && escalatedEnquiries.length > 0 && ' and '}
                {escalatedEnquiries.length > 0 && `${escalatedEnquiries.length} Escalated Staff Enquiry(ies)`}
                {' '}need administrative intervention.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {urgentComplaints.length > 0 && (
              <button
                onClick={() => {
                  setSearchParams({ tab: 'complaints' });
                  setPriorityFilter('urgent');
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
              >
                View Urgent Complaints ({urgentComplaints.length})
              </button>
            )}
            {escalatedEnquiries.length > 0 && (
              <button
                onClick={() => setSearchParams({ tab: 'enquiries' })}
                className="px-3 py-1.5 bg-sk-navy hover:bg-sk-navy-light text-white text-xs font-bold rounded-lg transition"
              >
                View Escalated Enquiries ({escalatedEnquiries.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => { setSearchParams({ tab: 'complaints' }); setStatusFilter('all'); setPriorityFilter('all'); }}
          className={`p-4 bg-white rounded-2xl border cursor-pointer transition ${activeTab === 'complaints' ? 'border-sk-yellow shadow-md ring-2 ring-sk-yellow/30' : 'border-sk-border shadow-sm'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500 uppercase">Complaints</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sk-navy">{complaints.length}</span>
            <span className="text-xs text-red-600 font-bold">
              {complaints.filter(c => ['pending', 'under_review', 'in_progress'].includes(c.status)).length} pending
            </span>
          </div>
        </div>

        <div 
          onClick={() => { setSearchParams({ tab: 'tickets' }); setStatusFilter('all'); }}
          className={`p-4 bg-white rounded-2xl border cursor-pointer transition ${activeTab === 'tickets' ? 'border-sk-yellow shadow-md ring-2 ring-sk-yellow/30' : 'border-sk-border shadow-sm'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500 uppercase">Support Tickets</span>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sk-navy">{tickets.length}</span>
            <span className="text-xs text-blue-600 font-bold">
              {tickets.filter(t => ['open', 'in_progress', 'waiting_for_parent'].includes(t.status)).length} active
            </span>
          </div>
        </div>

        <div 
          onClick={() => { setSearchParams({ tab: 'enquiries' }); setStatusFilter('all'); }}
          className={`p-4 bg-white rounded-2xl border cursor-pointer transition ${activeTab === 'enquiries' ? 'border-sk-yellow shadow-md ring-2 ring-sk-yellow/30' : 'border-sk-border shadow-sm'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500 uppercase">Staff Enquiries</span>
            <Briefcase className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sk-navy">{enquiries.length}</span>
            {escalatedEnquiries.length > 0 && (
              <span className="text-xs text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                {escalatedEnquiries.length} escalated
              </span>
            )}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-sk-border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500 uppercase">Resolved Issues</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sk-navy">
              {complaints.filter(c => c.status === 'resolved').length +
               tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length +
               enquiries.filter(e => e.status === 'resolved').length}
            </span>
            <span className="text-xs text-emerald-600 font-bold">Total resolved</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS & FILTERS */}
      <div className="bg-white rounded-2xl border border-sk-border shadow-sm overflow-hidden">
        
        {/* Tabs Bar */}
        <div className="flex items-center justify-between px-6 border-b border-sk-border bg-gray-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchParams({ tab: 'complaints' });
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
              }}
              className={`py-4 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'complaints' ? 'border-sk-yellow-dark text-sk-navy bg-sk-yellow/10' : 'border-transparent text-gray-500 hover:text-sk-navy'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              All Complaints ({complaints.length})
            </button>

            <button
              onClick={() => {
                setSearchParams({ tab: 'tickets' });
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className={`py-4 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'tickets' ? 'border-sk-yellow-dark text-sk-navy bg-sk-yellow/10' : 'border-transparent text-gray-500 hover:text-sk-navy'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Support Tickets ({tickets.length})
            </button>

            <button
              onClick={() => {
                setSearchParams({ tab: 'enquiries' });
                setStatusFilter('all');
              }}
              className={`py-4 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'enquiries' ? 'border-sk-yellow-dark text-sk-navy bg-sk-yellow/10' : 'border-transparent text-gray-500 hover:text-sk-navy'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Staff Enquiries ({enquiries.length})
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-sk-border bg-white flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab} by ID, subject, parent, student...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sk-yellow bg-gray-50 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-xs font-medium focus:outline-none"
            >
              <option value="all">All Statuses</option>
              {activeTab === 'complaints' && (
                <>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </>
              )}
              {activeTab === 'tickets' && (
                <>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_parent">Waiting for Parent</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </>
              )}
              {activeTab === 'enquiries' && (
                <>
                  <option value="new">New</option>
                  <option value="replied">Replied</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </>
              )}
            </select>

            {/* Priority Filter (Complaints only) */}
            {activeTab === 'complaints' && (
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-xs font-medium focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1 TABLE: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-sk-border text-gray-500 uppercase font-bold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Complaint ID</th>
                  <th className="px-5 py-3.5">Title / Issue</th>
                  <th className="px-5 py-3.5">Parent</th>
                  <th className="px-5 py-3.5">Student</th>
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
                      No complaints found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map(c => (
                    <tr 
                      key={c._id}
                      onClick={() => handleOpenDrawer(c, 'complaint')}
                      className={`hover:bg-gray-50/80 cursor-pointer transition ${c.priority === 'urgent' && c.status !== 'resolved' ? 'bg-red-50/40' : ''}`}
                    >
                      <td className="px-5 py-4 font-mono font-bold text-sk-navy">
                        {c.complaintId}
                        {c.internalNotes && (
                          <span className="ml-1.5 inline-block text-[10px] text-purple-700 bg-purple-100 px-1 rounded font-bold" title="Contains internal notes">
                            Note
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-sk-navy max-w-xs truncate" title={c.subject}>{c.subject}</p>
                        <p className="text-[11px] text-gray-400">{c.category}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">{c.user?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-gray-400">{c.user?.phone || c.user?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {c.student ? `${c.student.name} (${c.student.className || ''})` : 'General'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          c.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDrawer(c, 'complaint')}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Review & Respond"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          {c.status !== 'resolved' && (
                            <button
                              onClick={(e) => handleQuickStatusUpdate(c._id, 'complaint', 'resolved', e)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Mark Resolved"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteComplaint(c._id, e)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2 TABLE: SUPPORT TICKETS */}
        {activeTab === 'tickets' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-sk-border text-gray-500 uppercase font-bold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Parent</th>
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
                    <td colSpan="8" className="p-8 text-center text-gray-400">
                      No support tickets found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(t => (
                    <tr 
                      key={t._id}
                      onClick={() => handleOpenDrawer(t, 'ticket')}
                      className="hover:bg-gray-50/80 cursor-pointer transition"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-sk-navy">
                        {t.ticketId}
                        {t.internalNotes && (
                          <span className="ml-1.5 inline-block text-[10px] text-purple-700 bg-purple-100 px-1 rounded font-bold" title="Contains internal notes">
                            Note
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-sk-navy max-w-xs truncate">{t.subject}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">{t.parent?.name || 'Parent'}</p>
                        <p className="text-[11px] text-gray-400">{t.parent?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{t.category}</td>
                      <td className="px-5 py-4 text-gray-600">{t.student?.name || 'General'}</td>
                      <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                      <td className="px-5 py-4 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenDrawer(t, 'ticket')}
                          className="px-3 py-1 bg-gray-100 hover:bg-sk-yellow text-sk-navy font-bold rounded-lg transition text-xs"
                        >
                          Open Chat ({t.messages?.length || 1})
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3 TABLE: STAFF ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-sk-border text-gray-500 uppercase font-bold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Enquiry ID</th>
                  <th className="px-5 py-3.5">Parent</th>
                  <th className="px-5 py-3.5">Assigned Staff</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Escalated?</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400">
                      No staff enquiries found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map(e => (
                    <tr 
                      key={e._id}
                      onClick={() => handleOpenDrawer(e, 'enquiry')}
                      className={`hover:bg-gray-50/80 cursor-pointer transition ${e.isEscalated ? 'bg-red-50/40' : ''}`}
                    >
                      <td className="px-5 py-4 font-mono font-bold text-sk-navy">
                        {e.enquiryId}
                        {e.internalNotes && (
                          <span className="ml-1.5 inline-block text-[10px] text-purple-700 bg-purple-100 px-1 rounded font-bold" title="Contains internal notes">
                            Note
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-800">{e.parent?.name || 'Parent'}</td>
                      <td className="px-5 py-4 text-gray-700">
                        {e.staff?.user?.name || 'Staff'} ({e.staff?.designation || 'Transport'})
                      </td>
                      <td className="px-5 py-4 font-bold text-sk-navy max-w-xs truncate">{e.subject}</td>
                      <td className="px-5 py-4">
                        {e.isEscalated ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase animate-pulse">
                            Escalated to Admin
                          </span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={e.status} /></td>
                      <td className="px-5 py-4 text-gray-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenDrawer(e, 'enquiry')}
                          className="px-3 py-1 bg-gray-100 hover:bg-sk-yellow text-sk-navy font-bold rounded-lg transition text-xs"
                        >
                          Review & Intervene
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ADMIN DETAIL & RESOLUTION DRAWER */}
      {isDrawerOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-sk-navy/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-sk-border animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-sk-border bg-gray-50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-sk-navy bg-sk-yellow px-2 py-0.5 rounded">
                    {selectedItem.complaintId || selectedItem.ticketId || selectedItem.enquiryId}
                  </span>
                  <span className="text-xs uppercase font-semibold text-gray-500">
                    {selectedType}
                  </span>
                  <StatusBadge status={selectedItem.status} />
                  {selectedItem.priority && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      selectedItem.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      selectedItem.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedItem.priority}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-sk-navy">{selectedItem.subject}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Submitted by <span className="font-semibold text-sk-navy">{selectedItem.user?.name || selectedItem.parent?.name}</span> on {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-sk-navy rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Parent & Student Details */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 font-semibold block mb-0.5">Parent Contact:</span>
                  <p className="font-bold text-sk-navy">{selectedItem.user?.name || selectedItem.parent?.name}</p>
                  <p className="text-gray-600">{selectedItem.user?.email || selectedItem.parent?.email}</p>
                  <p className="text-gray-600">{selectedItem.user?.phone || selectedItem.parent?.phone}</p>
                </div>

                <div>
                  <span className="text-gray-500 font-semibold block mb-0.5">Regarding Student:</span>
                  <p className="font-bold text-sk-navy">{selectedItem.student?.name || 'General / Unspecified'}</p>
                  {selectedItem.student?.className && (
                    <p className="text-gray-600">Class {selectedItem.student.className}-{selectedItem.student.division || ''}</p>
                  )}
                </div>
              </div>

              {/* Initial Issue Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Original Description</span>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedItem.description || selectedItem.message}
                </div>
              </div>

              {/* Attachment Preview (if any) */}
              {selectedItem.attachment && (
                <div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Uploaded Attachment</span>
                  <img 
                    src={selectedItem.attachment} 
                    alt="Complaint Evidence" 
                    className="w-48 h-32 object-cover rounded-xl border border-gray-300 shadow-sm"
                  />
                </div>
              )}

              {/* Conversation Messages */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sk-yellow-dark" />
                  Conversation Thread ({(selectedItem.messages || []).length})
                </span>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {(selectedItem.messages || []).map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl text-xs ${
                        msg.senderRole === 'admin' 
                          ? 'bg-purple-50 border border-purple-200 text-purple-950 ml-4' 
                          : msg.senderRole === 'staff'
                          ? 'bg-blue-50 border border-blue-200 text-blue-950 ml-4'
                          : 'bg-gray-100 text-gray-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 text-[10px] text-gray-500 font-semibold">
                        <span>{msg.senderName || (msg.senderRole === 'admin' ? 'Administrator' : 'Parent')} ({msg.senderRole})</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Resolution Form */}
              <form onSubmit={handleSaveDrawerActions} className="space-y-4 pt-4 border-t border-gray-200">
                
                {/* Status Update */}
                <div>
                  <label className="block text-xs font-bold text-sk-navy mb-1">
                    Update Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white text-xs font-bold focus:ring-2 focus:ring-sk-yellow outline-none"
                  >
                    {selectedType === 'complaint' && (
                      <>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </>
                    )}
                    {selectedType === 'ticket' && (
                      <>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_for_parent">Waiting for Parent</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </>
                    )}
                    {selectedType === 'enquiry' && (
                      <>
                        <option value="new">New</option>
                        <option value="replied">Replied</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Reply to Parent */}
                <div>
                  <label className="block text-xs font-bold text-sk-navy mb-1">
                    Official Admin Reply <span className="text-gray-400 font-normal">(Sent directly to parent)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Type official reply or resolution update..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-sk-yellow outline-none"
                  ></textarea>
                </div>

                {/* Internal Notes (Admin-Only) */}
                <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    Internal Notes (Strictly Confidential - Administrators Only)
                  </div>
                  <p className="text-[10px] text-purple-700 mb-2">
                    Internal notes are never exposed or returned to parents or staff members.
                  </p>
                  <textarea
                    rows={2}
                    placeholder="Enter confidential notes regarding bus inspection, driver reprimand, or internal decisions..."
                    value={internalNotesText}
                    onChange={(e) => setInternalNotesText(e.target.value)}
                    className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-400 outline-none"
                  ></textarea>
                </div>

                {/* Resolution Notes for Complaints */}
                {selectedType === 'complaint' && (
                  <div>
                    <label className="block text-xs font-bold text-sk-navy mb-1">
                      Resolution Notes <span className="text-gray-400 font-normal">(Recorded on resolution)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Driver reminded of schedule; route timing adjusted by 10 minutes."
                      value={resolutionNotesText}
                      onChange={(e) => setResolutionNotesText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-sk-yellow outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <PrimaryButton
                    type="submit"
                    isLoading={isSubmittingAction}
                    className="!py-2 !px-4 text-xs font-bold"
                  >
                    Save & Send Update
                  </PrimaryButton>
                </div>

              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintList;
