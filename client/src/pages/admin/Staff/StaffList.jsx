import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, MoreVertical, Eye, Edit, Trash2, User, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStaff, deleteStaff } from '../../../services/staffService';
import StatusBadge from '../../../components/ui/StatusBadge';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const StaffList = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getStaff();
      if (res.status) {
        setStaff(res.data);
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load staff';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const res = await deleteStaff(id);
        if (res.status) {
          toast.success('Staff deleted successfully');
          setStaff(staff.filter(s => s._id !== id));
        }
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Failed to delete staff';
        toast.error(message);
      }
    }
  };

  const filteredStaff = staff.filter(member => {
    const term = searchTerm.toLowerCase();
    const nameMatch = member.user?.name?.toLowerCase().includes(term);
    const emailMatch = member.user?.email?.toLowerCase().includes(term);
    const phoneMatch = member.user?.phone?.includes(term);
    
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Staff Management</h1>
          <p className="text-gray-500 font-medium">Manage staff information, roles, and bus assignments.</p>
        </div>
        <PrimaryButton onClick={() => navigate('/admin/staff/create')} className="shrink-0 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Staff
        </PrimaryButton>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-sk-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
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
            Loading staff...
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-sk-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Staff Name</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Assignment</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {member.user?.profileImage ? (
                          <img src={member.user.profileImage} alt={member.user?.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sk-navy">{member.user?.name}</p>
                        <p className="text-xs text-gray-500">ID: {member.staffId} • {member.designation}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-600 font-medium">{member.user?.email || '-'}</span>
                        <span className="text-gray-500 text-xs">{member.user?.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.assignedBus || member.assignedRoute ? (
                        <div className="flex flex-col gap-1">
                          {member.assignedBus && (
                            <span className="text-xs text-gray-600">Bus: {member.assignedBus.busNumber}</span>
                          )}
                          {member.assignedRoute && (
                            <span className="text-xs text-gray-600">Route: {member.assignedRoute.routeName}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={member.status === 'active' && member.user?.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/admin/staff/${member._id}`)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg tooltip" title="View Profile">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/admin/staff/${member._id}/edit`)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg tooltip" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(member._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg tooltip" title="Delete">
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
              <Briefcase className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-sk-navy mb-2">No staff yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">Add your first staff member to start managing operations.</p>
            <PrimaryButton onClick={() => navigate('/admin/staff/create')} className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Staff
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;
