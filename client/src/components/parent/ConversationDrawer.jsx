import React, { useState } from 'react';
import { 
  X, Send, User, ShieldAlert, MessageSquare, Briefcase, 
  Clock, Calendar, AlertTriangle, CheckCircle, CheckCircle2, 
  Phone, AlertCircle, ArrowUpRight, Lock, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../ui/StatusBadge';
import PrimaryButton from '../ui/PrimaryButton';
import { addComplaintMessage } from '../../services/complaintService';
import { replyTicket, updateTicketStatus } from '../../services/ticketService';
import { replyEnquiry, escalateEnquiry } from '../../services/enquiryService';

const ConversationDrawer = ({ 
  isOpen, 
  onClose, 
  item, 
  type, // 'complaint' | 'ticket' | 'enquiry'
  onRefresh,
  currentUser
}) => {
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [imageModalUrl, setImageModalUrl] = useState('');

  if (!isOpen || !item) return null;

  const isComplaint = type === 'complaint';
  const isTicket = type === 'ticket';
  const isEnquiry = type === 'enquiry';

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Message text cannot be empty');
      return;
    }

    setIsSending(true);
    try {
      let res;
      if (isComplaint) {
        res = await addComplaintMessage(item._id, { message: replyText.trim() });
      } else if (isTicket) {
        res = await replyTicket(item._id, { message: replyText.trim() });
      } else if (isEnquiry) {
        res = await replyEnquiry(item._id, { message: replyText.trim() });
      }

      if (res?.status) {
        toast.success('Message sent successfully');
        setReplyText('');
        if (onRefresh) onRefresh();
      } else {
        toast.error(res?.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm('Are you sure you want to mark this support ticket as closed?')) return;
    try {
      const res = await updateTicketStatus(item._id, { status: 'closed' });
      if (res?.status) {
        toast.success('Ticket marked as closed');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close ticket');
    }
  };

  const handleEscalateEnquiry = async (e) => {
    e.preventDefault();
    setIsEscalating(true);
    try {
      const res = await escalateEnquiry(item._id, { 
        reason: escalateReason.trim() || 'Parent requested administrative review due to lack of resolution.' 
      });
      if (res?.status) {
        toast.success('Enquiry has been escalated to school administration!');
        setShowEscalateModal(false);
        setEscalateReason('');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to escalate enquiry');
    } finally {
      setIsEscalating(false);
    }
  };

  const referenceId = item.complaintId || item.ticketId || item.enquiryId || 'Details';
  const messages = item.messages || [];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-sk-navy/70 backdrop-blur-sm flex justify-end">
        <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-sk-border animate-in slide-in-from-right duration-200">
          
          {/* Top Bar Header */}
          <div className="p-6 border-b border-sk-border bg-sk-yellow-background flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-sk-navy bg-sk-yellow px-2 py-0.5 rounded shadow-sm">
                  {referenceId}
                </span>
                <span className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
                  {type}
                </span>
                <StatusBadge status={item.status} />
                {item.priority && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                    item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.priority}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-sk-navy leading-snug">{item.subject}</h2>
              {item.student && (
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-semibold text-sk-navy">Student:</span> {item.student.name} {item.student.className ? `(Class ${item.student.className}-${item.student.division || ''})` : ''}
                </p>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-sk-navy hover:bg-white rounded-lg transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Escalation Alert for Enquiry */}
            {isEnquiry && item.isEscalated && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-900">Escalated to Administration</h4>
                  <p className="text-xs text-red-700 mt-0.5">
                    This enquiry was escalated on {item.escalatedAt ? new Date(item.escalatedAt).toLocaleDateString() : 'recently'}. Reason: "{item.escalationReason}"
                  </p>
                </div>
              </div>
            )}

            {/* Staff Card for Enquiry */}
            {isEnquiry && item.staff && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sk-navy text-white flex items-center justify-center font-bold text-sm">
                    {item.staff.user?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-sk-navy">{item.staff.user?.name || 'Assigned Staff'}</p>
                    <p className="text-xs text-gray-500">{item.staff.designation || 'Transport Staff'} • Bus: {item.staff.assignedBus?.busNumber || 'Assigned'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.staff.user?.phone && (
                    <a
                      href={`tel:${item.staff.user.phone}`}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                      title="Call staff directly"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  )}
                  {!item.isEscalated && item.status !== 'resolved' && (
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Escalate to Admin
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Original Description */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Initial Issue / Request</span>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {item.description || item.message}
              </p>
              
              {/* Complaint Attachment Thumbnail */}
              {item.attachment && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Photo Attachment:
                  </p>
                  <img
                    src={item.attachment}
                    alt="Complaint evidence"
                    onClick={() => setImageModalUrl(item.attachment)}
                    className="w-36 h-28 object-cover rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:opacity-90 transition"
                  />
                </div>
              )}
            </div>

            {/* Official Admin Response Box (For Complaints) */}
            {isComplaint && item.adminReply && (
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                <div className="flex items-center gap-2 mb-2 pl-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Official Admin Response</span>
                  {item.repliedAt && (
                    <span className="text-[11px] text-emerald-700 ml-auto">
                      {new Date(item.repliedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-emerald-950 pl-2 whitespace-pre-wrap font-medium">
                  {item.adminReply}
                </p>
                {item.resolutionNotes && (
                  <div className="mt-3 pt-2 border-t border-emerald-200 pl-2 text-xs text-emerald-800">
                    <span className="font-bold">Resolution Notes:</span> {item.resolutionNotes}
                  </div>
                )}
              </div>
            )}

            {/* Close Ticket Action for Parent */}
            {isTicket && item.status !== 'closed' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                <p className="text-xs text-blue-800">
                  Has your support request been resolved? You may mark this ticket as closed.
                </p>
                <button
                  onClick={handleCloseTicket}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 transition shadow-sm"
                >
                  Close Ticket
                </button>
              </div>
            )}

            {/* Conversation Thread Messages */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sk-yellow-dark" />
                Conversation History ({messages.length})
              </h3>

              {messages.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No follow-up messages yet.</p>
              ) : (
                messages.map((msg, index) => {
                  const isParentMsg = msg.senderRole === 'parent' || msg.sender?._id === currentUser?._id;
                  const isAdminMsg = msg.senderRole === 'admin';
                  const isStaffMsg = msg.senderRole === 'staff';

                  return (
                    <div 
                      key={index} 
                      className={`flex flex-col ${isParentMsg ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className={`text-[11px] font-bold ${
                          isParentMsg ? 'text-sk-navy' : isAdminMsg ? 'text-purple-700' : 'text-blue-700'
                        }`}>
                          {msg.senderName || msg.sender?.name || (isParentMsg ? 'You' : isAdminMsg ? 'Admin' : 'Staff')}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                          isParentMsg ? 'bg-amber-100 text-amber-800' :
                          isAdminMsg ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {msg.senderRole || (isParentMsg ? 'parent' : 'staff')}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                        isParentMsg 
                          ? 'bg-sk-yellow text-sk-navy font-medium rounded-tr-none shadow-sm' 
                          : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Reply Box Footer */}
          <div className="p-4 border-t border-sk-border bg-gray-50">
            {item.status === 'closed' ? (
              <p className="text-center text-xs text-gray-500 py-2">
                This item has been closed. Further replies are disabled.
              </p>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  rows={2}
                  placeholder={`Write your follow-up reply to ${isEnquiry ? 'staff' : 'admin'}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sk-yellow text-sm resize-none"
                  required
                ></textarea>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Notifications will be sent automatically
                  </span>
                  <PrimaryButton
                    type="submit"
                    isLoading={isSending}
                    className="!py-2 !px-4 text-xs font-bold"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Send Reply
                  </PrimaryButton>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Escalation Confirmation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-sk-navy">Escalate to Administrator</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Escalating this enquiry will immediately alert school administrators that this issue requires administrative intervention.
            </p>
            
            <form onSubmit={handleEscalateEnquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason for Escalation
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. No staff response for over 48 hours, or unresolved timing issue..."
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEscalating}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  {isEscalating ? 'Escalating...' : 'Confirm Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {imageModalUrl && (
        <div 
          onClick={() => setImageModalUrl('')}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <img src={imageModalUrl} alt="Complaint preview" className="w-full h-auto object-contain max-h-[85vh]" />
            <button 
              onClick={() => setImageModalUrl('')}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationDrawer;
