import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, MessageSquare, MoreVertical, Eye, Trash2, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getComplaints, deleteComplaint, updateComplaint } from '../../../services/complaintService';
import StatusBadge from '../../../components/ui/StatusBadge';

const ComplaintList = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await getComplaints();
      if (res.status) {
        setComplaints(res.data);
      }
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        const res = await deleteComplaint(id);
        if (res.status) {
          toast.success('Complaint deleted successfully');
          setComplaints(complaints.filter(c => c._id !== id));
        }
      } catch (error) {
        toast.error('Failed to delete complaint');
      }
    }
  };
  
  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await updateComplaint(id, { status });
      if (res.status) {
        toast.success(`Marked as ${status}`);
        fetchComplaints();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const term = searchTerm.toLowerCase();
    return c.complaintId?.toLowerCase().includes(term) || 
           c.subject?.toLowerCase().includes(term) || 
           c.user?.name?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Complaints & Feedback</h1>
          <p className="text-gray-500 font-medium">Manage and respond to user issues.</p>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-sk-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search complaints, users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sk-yellow bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-sk-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading complaints...
          </div>
        ) : filteredComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-sk-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Issue</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <AlertCircle className={`w-5 h-5 ${c.priority === 'urgent' ? 'text-red-500' : 'text-orange-500'}`} />
                      </div>
                      <div className="max-w-[200px] truncate">
                        <p className="font-semibold text-sk-navy truncate" title={c.subject}>{c.subject}</p>
                        <p className="text-xs text-gray-500">{c.complaintId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-600 font-medium">{c.user?.name || 'Unknown'}</span>
                        <span className="text-gray-500 text-xs capitalize">{c.user?.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize
                         ${c.priority === 'urgent' ? 'bg-red-100 text-red-700' : 
                           c.priority === 'high' ? 'bg-orange-100 text-orange-700' : 
                           c.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 
                           'bg-gray-100 text-gray-700'}`}>
                         {c.priority}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c.status !== 'resolved' && (
                          <button onClick={() => handleStatusUpdate(c._id, 'resolved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg tooltip" title="Mark Resolved">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => navigate(`/admin/complaints/${c._id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg tooltip" title="View & Reply">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg tooltip" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="md:hidden">
                         <MoreVertical className="w-5 h-5 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="bg-gray-50 p-6 rounded-full mb-4 text-gray-400">
              <MessageSquare className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-sk-navy mb-2">No complaints</h3>
            <p className="text-gray-500 max-w-sm mb-6">You're all caught up! There are no complaints matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintList;
