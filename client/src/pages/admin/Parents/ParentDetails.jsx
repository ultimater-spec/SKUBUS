import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, User, Phone, Mail, MapPin, Map, Bus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getParentById, deleteParent } from '../../../services/parentService';
import StatusBadge from '../../../components/ui/StatusBadge';

const ParentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);



  const fetchParent = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getParentById(id);
      if (res.status) {
        setParent(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load parent details');
      navigate('/admin/parents');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchParent();
  }, [fetchParent]);

  const handleDelete = async () => {
    if (parent.children && parent.children.length > 0) {
      toast.error('This parent has students assigned. Reassign the students before deleting this parent.');
      return;
    }

    if (window.confirm('Are you sure you want to permanently delete this parent?')) {
      try {
        await deleteParent(id);
        toast.success('Parent deleted successfully');
        navigate('/admin/parents');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete parent');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!parent) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <button onClick={() => navigate('/admin/parents')} className="p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors self-start">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative w-24 h-24 rounded-full border-4 border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {parent.user?.profileImage ? (
              <img src={parent.user.profileImage} alt={parent.user?.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-gray-300" />
            )}
          </div>
          <div className="text-center sm:text-left pt-1">
            <h1 className="text-2xl font-bold text-sk-navy mb-1">{parent.user?.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2 text-sm text-gray-500">
              <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">ID: {parent.parentId}</span>
            </div>
            <StatusBadge status={parent.user?.isActive ? 'active' : 'inactive'} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 md:mt-0">
          <button onClick={() => navigate(`/admin/parents/${parent._id}/edit`)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PERSONAL INFO */}
        <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
          <div className="p-4 border-b border-sk-border bg-gray-50/50">
            <h2 className="font-bold text-sk-navy flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Parent Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
              <div className="col-span-2 md:col-span-1">
                <p className="text-gray-500 mb-1">Full Name</p>
                <p className="font-semibold text-sk-navy">{parent.user?.name}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-gray-500 mb-1">Parent ID</p>
                <p className="font-semibold text-sk-navy">{parent.parentId}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-sk-navy flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" /> {parent.user?.phone || 'N/A'}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-medium text-sk-navy flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-400" /> {parent.user?.email || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Emergency Contact</p>
                <p className="font-medium text-sk-navy flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-sk-error" /> {parent.emergencyContact || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Home Address</p>
                <p className="font-medium text-sk-navy flex items-start gap-1">
                  <MapPin className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" /> 
                  {parent.address || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CHILDREN INFO */}
        <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
          <div className="p-4 border-b border-sk-border bg-gray-50/50">
            <h2 className="font-bold text-sk-navy flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Children Information</h2>
          </div>
          <div className="p-5">
            {parent.children && parent.children.length > 0 ? (
              <div className="space-y-4">
                {parent.children.map((child) => (
                  <div key={child._id} className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sk-navy text-sm cursor-pointer hover:underline" onClick={() => navigate(`/admin/students/${child._id}`)}>
                          {child.name}
                        </p>
                        <p className="text-xs text-gray-500">ID: {child.studentId} • Class: {child.className} {child.division}</p>
                      </div>
                      <StatusBadge status={child.status} />
                    </div>
                    
                    <div className="flex gap-4 pt-2 border-t border-gray-200/60">
                      {child.assignedBus ? (
                        <>
                          <div className="flex items-center gap-1.5 text-xs text-sk-navy">
                            <Bus className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium">Bus {child.assignedBus.busNumber}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-sk-navy">
                            <Map className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium">{child.assignedRoute?.routeName || 'No Route'}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No transport assigned</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">No students assigned.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentDetails;
