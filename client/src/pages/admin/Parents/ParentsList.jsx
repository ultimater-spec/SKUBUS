import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, MoreVertical, Eye, Edit, Trash2, User, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getParents, deleteParent } from '../../../services/parentService';
import StatusBadge from '../../../components/ui/StatusBadge';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const ParentsList = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await getParents();
      if (res.status) {
        setParents(res.data);
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load parents';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parent?')) {
      try {
        const res = await deleteParent(id);
        if (res.status) {
          toast.success('Parent deleted successfully');
          setParents(parents.filter(p => p._id !== id));
        }
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Failed to delete parent';
        toast.error(message);
      }
    }
  };

  const filteredParents = parents.filter(parent => {
    const term = searchTerm.toLowerCase();
    const nameMatch = parent.user?.name?.toLowerCase().includes(term);
    const emailMatch = parent.user?.email?.toLowerCase().includes(term);
    const phoneMatch = parent.user?.phone?.includes(term);
    
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Parents</h1>
          <p className="text-gray-500 font-medium">Manage parent information, contact details, and student relationships.</p>
        </div>
        <PrimaryButton onClick={() => navigate('/admin/parents/create')} className="shrink-0 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Parent
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
            Loading parents...
          </div>
        ) : filteredParents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-sk-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Parent Name</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Children</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParents.map((parent) => (
                  <tr key={parent._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {parent.user?.profileImage ? (
                          <img src={parent.user.profileImage} alt={parent.user?.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sk-navy">{parent.user?.name}</p>
                        <p className="text-xs text-gray-500">ID: {parent.parentId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-600 font-medium">{parent.user?.email || '-'}</span>
                        <span className="text-gray-500 text-xs">{parent.user?.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {parent.children && parent.children.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {parent.children.map(child => (
                            <span key={child._id} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full w-max">
                              <User className="w-3 h-3" /> {child.name} ({child.className || '-'})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">No students assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={parent.user?.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/admin/parents/${parent._id}`)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg tooltip" title="View Profile">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/admin/parents/${parent._id}/edit`)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg tooltip" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(parent._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg tooltip" title="Delete">
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
              <Users className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-sk-navy mb-2">No parents yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">Add your first parent to start managing relationships.</p>
            <PrimaryButton onClick={() => navigate('/admin/parents/create')} className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Parent
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentsList;
