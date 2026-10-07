import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, AlertCircle, Clock, Calendar, CheckCircle } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await getComplaintById(id);
        if (res.status && res.data) {
          setComplaint(res.data);
          setReply(res.data.adminReply || '');
        }
      } catch (error) {
        toast.error('Failed to load complaint details');
        navigate('/admin/complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, navigate]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await updateComplaint(id, { 
        adminReply: reply,
        status: 'resolved'
      });
      if (res.status && res.data) {
        toast.success('Reply sent and marked as resolved');
        setComplaint(res.data);
      }
    } catch (error) {
      toast.error('Failed to send reply');
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/complaints')} className="p-2 bg-white rounded-lg shadow-sm border border-sk-border hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-sk-navy mb-1">Complaint Details</h1>
          <p className="text-gray-500 text-sm">Review and respond to the issue.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
        
        {/* COMPLAINT HEADER */}
        <div className="p-6 border-b border-sk-border bg-gray-50/50">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-lg">
                  {complaint.complaintId}
                </span>
                <StatusBadge status={complaint.status} />
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize
                  ${complaint.priority === 'urgent' ? 'bg-red-100 text-red-700' : 
                    complaint.priority === 'high' ? 'bg-orange-100 text-orange-700' : 
                    complaint.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-700'}`}>
                  {complaint.priority} Priority
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-sk-navy">{complaint.subject}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800 flex items-center justify-end gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" /> 
                {new Date(complaint.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 flex items-center justify-end gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" /> 
                {new Date(complaint.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* COMPLAINT BODY */}
        <div className="p-6 border-b border-sk-border">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
              {complaint.user?.profileImage ? (
                <img src={complaint.user.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-sk-yellow/20 text-sk-navy font-bold">
                  {complaint.user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{complaint.user?.name} <span className="text-gray-400 text-sm font-normal">({complaint.user?.role})</span></p>
              <p className="text-sm text-gray-500">{complaint.user?.email} | {complaint.user?.phone}</p>
              {complaint.student && (
                <p className="text-sm text-sk-navy mt-1">
                  <span className="font-medium text-gray-600">Regarding Student:</span> {complaint.student.name} ({complaint.student.className}-{complaint.student.division})
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 whitespace-pre-wrap text-gray-700 leading-relaxed">
            {complaint.description}
          </div>
        </div>

        {/* ADMIN REPLY SECTION */}
        <div className="p-6 bg-gray-50/50">
          <h3 className="text-lg font-bold text-sk-navy mb-4 flex items-center gap-2">
            Admin Response
            {complaint.status === 'resolved' && <CheckCircle className="w-5 h-5 text-green-500" />}
          </h3>
          
          {complaint.adminReply ? (
            <div className="bg-white rounded-xl p-5 border border-sk-yellow/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-sk-yellow"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-sk-navy text-white flex items-center justify-center font-bold text-sm">
                  {complaint.repliedBy?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{complaint.repliedBy?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{new Date(complaint.repliedAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap pl-10 text-sm">
                {complaint.adminReply}
              </div>
            </div>
          ) : (
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your official response here. This will be visible to the user..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sk-yellow outline-none min-h-[150px] resize-y"
                required
              />
              <div className="flex justify-end">
                <PrimaryButton type="submit" isLoading={isSubmitting}>
                  Send Reply & Resolve
                </PrimaryButton>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default ComplaintDetails;
