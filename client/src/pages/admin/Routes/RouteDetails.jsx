import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Map, Clock, MapPin, Bus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRouteById } from '../../../services/routeService';
import StatusBadge from '../../../components/ui/StatusBadge';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const RouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await getRouteById(id);
        if (res.status && res.data) {
          setRoute(res.data);
        }
      } catch (error) {
        toast.error('Failed to load route details');
        navigate('/admin/routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!route) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/routes')} className="p-2 bg-white rounded-lg shadow-sm border border-sk-border hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Route Details</h1>
            <p className="text-gray-500 font-medium">View path and stops information</p>
          </div>
        </div>
        <PrimaryButton onClick={() => navigate(`/admin/routes/${id}/edit`)} className="flex items-center gap-2">
          <Edit className="w-5 h-5" /> Edit Route
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-sk-yellow/20 flex items-center justify-center">
                <Map className="w-8 h-8 text-sk-navy" />
              </div>
              <StatusBadge status={route.status} />
            </div>
            
            <h2 className="text-2xl font-bold text-sk-navy">{route.routeName}</h2>
            <p className="text-gray-500 font-medium mb-6">Route #{route.routeNumber}</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Path</p>
                  <p className="font-medium text-gray-800">{route.startingPoint} to {route.destination}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Estimated Time</p>
                  <p className="font-medium text-gray-800">{route.estimatedDuration ? `${route.estimatedDuration} mins` : '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* BUS ASSIGNMENT */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border p-6">
            <h3 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Assigned Bus</h3>
            {route.assignedBus ? (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <Bus className="w-6 h-6 text-sk-navy" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-sk-navy">Bus {route.assignedBus.busNumber}</p>
                  <p className="text-sm text-gray-500">{route.assignedBus.registrationNumber}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">No bus assigned to this route.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STOPS */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border p-6">
            <h3 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Route Stops ({route.stops?.length || 0})</h3>
            
            {route.stops && route.stops.length > 0 ? (
              <div className="relative border-l-2 border-sk-yellow/30 ml-4 mt-6 space-y-8">
                {route.stops.sort((a,b) => a.order - b.order).map((stop, index) => (
                  <div key={stop._id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-sk-yellow shadow-sm"></div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800 text-lg">{stop.order}. {stop.stopName}</h4>
                      </div>
                      
                      {stop.location && (
                        <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {stop.location}
                        </p>
                      )}
                      
                      <div className="flex gap-4 text-sm bg-white p-2 rounded-lg inline-flex shadow-sm border border-gray-100">
                        <div>
                          <span className="text-gray-400 text-xs block">Pickup</span>
                          <span className="font-medium text-sk-navy">{stop.pickupTime || '-'}</span>
                        </div>
                        <div className="w-px bg-gray-100"></div>
                        <div>
                          <span className="text-gray-400 text-xs block">Drop</span>
                          <span className="font-medium text-sk-navy">{stop.dropTime || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No stops added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
