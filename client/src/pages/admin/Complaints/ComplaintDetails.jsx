import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, AlertCircle, Clock, Calendar, CheckCircle, 
  Lock, MessageSquare, Send, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getComplaintById, updateComplaint } from '../../../services/complaintService';
import StatusBadge from '../../../components/ui/StatusBadge';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('pending');
  const [internalNotes, setInternalNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await getComplaintById(id);
      if (res.status && res.data) {
        setComplaint(res.data);
        setReply(res.data.adminReply || '');
        setStatus(res.data.status || 'pending');
        setInternalNotes(res.data.internalNotes || '');
        setResolutionNotes(res.data.resolutionNotes || '');
      }
    } catch (error) {
      toast.error('Failed to load complaint details');
      navigate('/admin/complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        status,
        internalNotes,
        resolutionNotes
      };
      if (reply.trim()) {
        payload.adminReply = reply.trim();
      }

      const res = await updateComplaint(id, payload);
      if (res.status && res.data) {
        toast.success('Complaint updated successfully');
        setComplaint(res.data);
      }
    } catch (error) {
      toast.error('Failed to update complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/complaints')} 
          className="p-2 bg-white rounded-xl shadow-sm border border-sk-border hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-sk-navy mb-0.5">Complaint Review</h1>
          <p className="text-gray-500 text-xs">Investigate issue, send response, and record resolution notes.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
        
        {/* Banner Header */}
        <div className="p-6 border-b border-sk-border bg-gray-50/70">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-sk-navy bg-sk-yellow px-2.5 py-1 rounded-lg">
                  {complaint.complaintId}
                </span>
                <StatusBadge status={complaint.status} />
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  complaint.priority === 'urgent' ? 'bg-red-100 text-red-700' : 
                  complaint.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {complaint.priority} Priority
                </span>
              </div>
              <h2 className="text-2xl font-bold text-sk-navy">{complaint.subject}</h2>
            </div>

            <div className="text-right text-xs text-gray-500">
              <p className="flex items-center justify-end gap-1.5 font-medium text-gray-700">
                <Calendar className="w-3.5 h-3.5" /> {new Date(complaint.createdAt).toLocaleDateString()}
              </p>
              <p className="flex items-center justify-end gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5" /> {new Date(complaint.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Parent & Student Details */}
        <div className="p-6 border-b border-sk-border flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/30 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sk-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
              {complaint.user?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <p className="font-bold text-sk-navy text-sm">{complaint.user?.name} <span className="text-gray-400 font-normal">({complaint.user?.role})</span></p>
              <p className="text-gray-600">{complaint.user?.email} • {complaint.user?.phone}</p>
            </div>
          </div>

          {complaint.student && (
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="font-semibold text-gray-500 block mb-0.5">Related Student:</span>
              <p className="font-bold text-sk-navy">{complaint.student.name}</p>
              <p className="text-gray-500">Class {complaint.student.className}-{complaint.student.division || ''} (ID: {complaint.student.studentId})</p>
            </div>
          )}
        </div>

        {/* Complaint Description */}
        <div className="p-6 border-b border-sk-border space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Complaint Description</h3>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 whitespace-pre-wrap text-xs text-gray-800 leading-relaxed font-medium">
            {complaint.description}
          </div>

          {complaint.attachment && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-600 mb-1.5">Submitted Attachment:</h4>
              <img 
                src={complaint.attachment} 
                alt="Complaint attachment" 
                className="w-48 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Conversation Thread */}
        <div className="p-6 border-b border-sk-border space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-sk-yellow-dark" />
            Conversation Timeline ({(complaint.messages || []).length})
          </h3>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {(complaint.messages || []).map((msg, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl text-xs ${
                  msg.senderRole === 'admin' 
                    ? 'bg-purple-50 border border-purple-200 text-purple-950 ml-6' 
                    : 'bg-gray-50 border border-gray-200 text-gray-800 mr-6'
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

        {/* Admin Action & Resolution Form */}
        <form onSubmit={handleUpdate} className="p-6 bg-gray-50/50 space-y-4">
          
          {/* Status Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-sk-navy mb-1">
                Change Complaint Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white text-xs font-bold focus:ring-2 focus:ring-sk-yellow outline-none"
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-sk-navy mb-1">
                Resolution Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Bus driver reprimanded, issue resolved"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-sk-yellow outline-none"
              />
            </div>
          </div>

          {/* Official Reply */}
          <div>
            <label className="block text-xs font-bold text-sk-navy mb-1">
              Official Admin Response (Visible to Parent)
            </label>
            <textarea
              rows={3}
              placeholder="Type your official response to the parent here..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-sk-yellow outline-none bg-white"
            ></textarea>
          </div>

          {/* Internal Notes */}
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs mb-1">
              <Lock className="w-3.5 h-3.5" />
              Internal Notes (Strictly Confidential - Admin Only)
            </div>
            <p className="text-[10px] text-purple-700 mb-2">
              Internal notes are never visible to parents or staff members under any circumstance.
            </p>
            <textarea
              rows={2}
              placeholder="Private notes for administrators..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-400 outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end pt-2">
            <PrimaryButton type="submit" isLoading={isSubmitting}>
              Save Updates & Send Response
            </PrimaryButton>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ComplaintDetails;
