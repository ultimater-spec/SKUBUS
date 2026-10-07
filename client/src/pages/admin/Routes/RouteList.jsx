import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, MoreVertical, Eye, Edit, Trash2, Map
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getRoutes, deleteRoute } from '../../../services/routeService';
import StatusBadge from '../../../components/ui/StatusBadge';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const RouteList = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await getRoutes();
      if (res.status) {
        setRoutes(res.data);
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load routes';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        const res = await deleteRoute(id);
        if (res.status) {
          toast.success('Route deleted successfully');
          setRoutes(routes.filter(r => r._id !== id));
        }
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Failed to delete route';
        toast.error(message);
      }
    }
  };

  const filteredRoutes = routes.filter(route => {
    const term = searchTerm.toLowerCase();
    const nameMatch = route.routeName?.toLowerCase().includes(term);
    const numMatch = route.routeNumber?.toLowerCase().includes(term);
    
    return nameMatch || numMatch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Route Management</h1>
          <p className="text-gray-500 font-medium">Manage bus routes and stops.</p>
        </div>
        <PrimaryButton onClick={() => navigate('/admin/routes/create')} className="shrink-0 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Route
        </PrimaryButton>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-sk-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by route name or number..." 
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
            Loading routes...
          </div>
        ) : filteredRoutes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-sk-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Route Details</th>
                  <th className="px-6 py-4 font-semibold">Path</th>
                  <th className="px-6 py-4 font-semibold">Stops</th>
                  <th className="px-6 py-4 font-semibold">Assigned Bus</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRoutes.map((route) => (
                  <tr key={route._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sk-yellow/20 flex items-center justify-center overflow-hidden shrink-0">
                        <Map className="w-5 h-5 text-sk-navy" />
                      </div>
                      <div>
                        <p className="font-semibold text-sk-navy">{route.routeName}</p>
                        <p className="text-xs text-gray-500">Route #{route.routeNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-600 font-medium">{route.startingPoint}</span>
                        <span className="text-gray-500 text-xs">to {route.destination}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-medium">{route.stops?.length || 0} Stops</span>
                    </td>
                    <td className="px-6 py-4">
                      {route.assignedBus ? (
                        <div className="flex flex-col">
                          <span className="text-gray-600 font-medium">Bus {route.assignedBus.busNumber}</span>
                          <span className="text-gray-500 text-xs">{route.assignedBus.registrationNumber}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={route.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/admin/routes/${route._id}`)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg tooltip" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/admin/routes/${route._id}/edit`)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg tooltip" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(route._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg tooltip" title="Delete">
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
              <Map className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-sk-navy mb-2">No routes yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">Add your first route to start mapping paths.</p>
            <PrimaryButton onClick={() => navigate('/admin/routes/create')} className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Route
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteList;
