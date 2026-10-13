import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Bus, MapPin, Users, MessageSquare, Clock, Send, CheckCircle2, 
  AlertCircle, RefreshCw, Camera, Bell, User, Phone, CheckCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logout } from '../store/slices/authSlice';
import { getMyStaffProfile } from '../services/staffService';
import { getEnquiries, replyEnquiry, updateEnquiryStatus } from '../services/enquiryService';
import { getNotifications } from '../services/notificationService';
import StatusBadge from '../components/ui/StatusBadge';
import PrimaryButton from '../components/ui/PrimaryButton';

const StaffDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [staffProfile, setStaffProfile] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Enquiry Thread Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('');

  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, enqRes, notifRes] = await Promise.allSettled([
        getMyStaffProfile(),
        getEnquiries(),
        getNotifications()
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value?.status) {
        setStaffProfile(profileRes.value.data);
      }
      if (enqRes.status === 'fulfilled' && enqRes.value?.status) {
        setEnquiries(enqRes.value.data || []);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value?.status) {
        setNotifications(notifRes.value.data || []);
      }
    } catch (error) {
      toast.error('Failed to load staff portal data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const handleOpenEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setStatusToUpdate(enquiry.status);
    setReplyMessage('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }

    setIsReplying(true);
    try {
      const res = await replyEnquiry(selectedEnquiry._id, { message: replyMessage.trim() });
      if (res.status) {
        toast.success('Reply sent to parent successfully');
        setReplyMessage('');
        await fetchStaffData();
        setSelectedEnquiry(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await updateEnquiryStatus(selectedEnquiry._id, { status: newStatus });
      if (res.status) {
        toast.success(`Enquiry marked as ${newStatus}`);
        setStatusToUpdate(newStatus);
        await fetchStaffData();
        setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-sk-navy via-sk-navy-light to-sk-navy text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-sk-yellow/20 text-sk-yellow text-xs font-bold uppercase tracking-wider border border-sk-yellow/30 mb-2">
              Staff Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name}
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Designation: <span className="text-sk-yellow font-bold">{staffProfile?.designation || 'Transport Staff'}</span> • Employee ID: <span className="font-mono">{staffProfile?.employeeId || '-'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/staff/scanner"
              className="px-4 py-2.5 bg-sk-yellow hover:bg-sk-yellow-dark text-sk-navy rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Camera className="w-4 h-4" /> Attendance Scanner
            </Link>
            <button
              onClick={fetchStaffData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Assigned Bus & Route Details */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sk-yellow text-sk-navy flex items-center justify-center font-bold">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-gray-300 text-[11px] block">Assigned Bus:</span>
              <p className="font-bold text-white text-sm">{staffProfile?.assignedBus?.busNumber || 'None Assigned'}</p>
              <p className="text-gray-400 text-[11px]">{staffProfile?.assignedBus?.registrationNumber || ''}</p>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sk-yellow text-sk-navy flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-gray-300 text-[11px] block">Assigned Route:</span>
              <p className="font-bold text-white text-sm">{staffProfile?.assignedRoute?.routeName || 'None Assigned'}</p>
              <p className="text-gray-400 text-[11px]">{staffProfile?.assignedRoute?.routeNumber ? `Route ${staffProfile.assignedRoute.routeNumber}` : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PARENT ENQUIRIES SECTION */}
      <div className="bg-white rounded-2xl border border-sk-border shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-sk-border flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-sk-navy flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sk-yellow-dark" />
              Parent Enquiries Inbox ({enquiries.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Messages received from parents regarding their children on your route.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-sk-border text-gray-500 uppercase font-bold text-[11px]">
              <tr>
                <th className="px-6 py-4">Enquiry ID</th>
                <th className="px-6 py-4">Parent</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-gray-400">
                    No enquiries received yet. When parents contact you, messages will appear here.
                  </td>
                </tr>
              ) : (
                enquiries.map(enq => (
                  <tr 
                    key={enq._id}
                    onClick={() => handleOpenEnquiry(enq)}
                    className="hover:bg-gray-50/80 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-sk-navy">{enq.enquiryId}</td>
                    <td className="px-6 py-4 font-bold text-sk-navy">{enq.parent?.name || 'Parent'}</td>
                    <td className="px-6 py-4 text-gray-600">{enq.student?.name || 'Student'}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">{enq.subject}</td>
                    <td className="px-6 py-4 text-gray-500">{enq.category}</td>
                    <td className="px-6 py-4"><StatusBadge status={enq.status} /></td>
                    <td className="px-6 py-4 text-gray-500">{new Date(enq.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenEnquiry(enq)}
                        className="px-3 py-1.5 bg-sk-yellow hover:bg-sk-yellow-dark text-sk-navy font-bold rounded-lg transition text-xs"
                      >
                        Open Conversation ({enq.messages?.length || 1})
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* CONVERSATION & REPLY MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-sk-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-sk-border overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-sk-border bg-gray-50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-sk-navy bg-sk-yellow px-2 py-0.5 rounded">
                    {selectedEnquiry.enquiryId}
                  </span>
                  <StatusBadge status={selectedEnquiry.status} />
                  {selectedEnquiry.isEscalated && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">
                      Escalated to Admin
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-sk-navy">{selectedEnquiry.subject}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Parent: <span className="font-bold text-sk-navy">{selectedEnquiry.parent?.name}</span> • Student: <span className="font-semibold text-gray-700">{selectedEnquiry.student?.name}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 text-gray-400 hover:text-sk-navy rounded-lg hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>

            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                <span className="font-bold text-gray-700 block mb-1">Initial Enquiry:</span>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedEnquiry.message}</p>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Messages ({(selectedEnquiry.messages || []).length})
                </h4>

                {(selectedEnquiry.messages || []).map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl text-xs ${
                      msg.senderRole === 'staff' 
                        ? 'bg-blue-50 border border-blue-200 text-blue-950 ml-6' 
                        : msg.senderRole === 'admin'
                        ? 'bg-purple-50 border border-purple-200 text-purple-950 ml-6'
                        : 'bg-gray-100 text-gray-800 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[10px] text-gray-500 font-semibold">
                      <span>{msg.senderName || msg.senderRole} ({msg.senderRole})</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="whitespace-pre-wrap font-medium">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply & Status Footer */}
            <div className="p-4 border-t border-sk-border bg-gray-50 space-y-3">
              
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">Update Status:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus('in_progress')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      selectedEnquiry.status === 'in_progress' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('resolved')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      selectedEnquiry.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendReply} className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Type your reply to the parent..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sk-yellow bg-white"
                  required
                ></textarea>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100"
                  >
                    Close
                  </button>
                  <PrimaryButton
                    type="submit"
                    isLoading={isReplying}
                    className="!py-2 !px-4 text-xs font-bold"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Send Reply
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

export default StaffDashboard;
