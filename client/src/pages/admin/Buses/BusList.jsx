import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, MoreVertical, Eye, Edit, Trash2, Bus as BusIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getBuses, deleteBus } from '../../../services/busService';
import StatusBadge from '../../../components/ui/StatusBadge';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const BusList = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchBuses = async () => {
    try {
      setLoading(true);
      const res = await getBuses();
      if (res.status) {
        setBuses(res.data);
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load buses';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        const res = await deleteBus(id);
        if (res.status) {
          toast.success('Bus deleted successfully');
          setBuses(buses.filter(b => b._id !== id));
        }
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Failed to delete bus';
        toast.error(message);
      }
    }
  };

  const filteredBuses = buses.filter(bus => {
    const term = searchTerm.toLowerCase();
    const numberMatch = bus.busNumber?.toLowerCase().includes(term);
    const regMatch = bus.registrationNumber?.toLowerCase().includes(term);
    
    return numberMatch || regMatch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Bus Management</h1>
          <p className="text-gray-500 font-medium">Manage school buses and their assignments.</p>
        </div>
        <PrimaryButton onClick={() => navigate('/admin/buses/create')} className="shrink-0 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Bus
        </PrimaryButton>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-sk-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by bus number or registration..." 
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
            Loading buses...
          </div>
        ) : filteredBuses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-sk-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Bus Details</th>
                  <th className="px-6 py-4 font-semibold">Capacity</th>
                  <th className="px-6 py-4 font-semibold">Driver</th>
                  <th className="px-6 py-4 font-semibold">Route</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBuses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sk-yellow/20 flex items-center justify-center overflow-hidden shrink-0">
                        <BusIcon className="w-5 h-5 text-sk-navy" />
                      </div>
                      <div>
                        <p className="font-semibold text-sk-navy">Bus {bus.busNumber}</p>
                        <p className="text-xs text-gray-500">{bus.registrationNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-medium">{bus.capacity} Seats</span>
                    </td>
                    <td className="px-6 py-4">
                      {bus.driver ? (
                        <div className="flex flex-col">
                          <span className="text-gray-600 font-medium">{bus.driver.user?.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {bus.assignedRoute ? (
                        <span className="text-gray-600 font-medium">{bus.assignedRoute.routeName}</span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={bus.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/admin/buses/${bus._id}`)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg tooltip" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/admin/buses/${bus._id}/edit`)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg tooltip" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(bus._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg tooltip" title="Delete">
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
              <BusIcon className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-sk-navy mb-2">No buses yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">Add your first bus to start managing transportation.</p>
            <PrimaryButton onClick={() => navigate('/admin/buses/create')} className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Bus
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusList;
