import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Bus as BusIcon, Users, User, Map, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBusById } from '../../../services/busService';
import StatusBadge from '../../../components/ui/StatusBadge';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const BusDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await getBusById(id);
        if (res.status && res.data) {
          setBus(res.data);
        }
      } catch (error) {
        toast.error('Failed to load bus details');
        navigate('/admin/buses');
      } finally {
        setLoading(false);
      }
    };

    fetchBus();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!bus) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/buses')} className="p-2 bg-white rounded-lg shadow-sm border border-sk-border hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Bus Details</h1>
            <p className="text-gray-500 font-medium">View detailed bus and assignment information</p>
          </div>
        </div>
        <PrimaryButton onClick={() => navigate(`/admin/buses/${id}/edit`)} className="flex items-center gap-2">
          <Edit className="w-5 h-5" /> Edit Bus
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-sk-yellow/20 flex items-center justify-center">
                <BusIcon className="w-8 h-8 text-sk-navy" />
              </div>
              <StatusBadge status={bus.status} />
            </div>
            
            <h2 className="text-2xl font-bold text-sk-navy">Bus {bus.busNumber}</h2>
            <p className="text-gray-500 font-medium mb-6">{bus.registrationNumber}</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Capacity</p>
                  <p className="font-medium text-gray-800">{bus.capacity} Seats</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Model & Year</p>
                  <p className="font-medium text-gray-800">{bus.model || '-'} {bus.year ? `(${bus.year})` : ''}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ASSIGNMENTS */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border p-6">
            <h3 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Crew & Route Assignments</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm mt-1">
                  <Map className="w-6 h-6 text-sk-navy" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Assigned Route</h4>
                  {bus.assignedRoute ? (
                    <div>
                      <p className="text-lg font-semibold text-sk-navy">{bus.assignedRoute.routeName}</p>
                      <p className="text-sm text-gray-500">Route #{bus.assignedRoute.routeNumber}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm">No route assigned currently.</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm mt-1">
                  <User className="w-6 h-6 text-sk-navy" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Assigned Driver</h4>
                  {bus.driver ? (
                    <div>
                      <p className="text-lg font-semibold text-sk-navy">{bus.driver.user?.name}</p>
                      <p className="text-sm text-gray-500">{bus.driver.user?.phone} | {bus.driver.employeeId}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm">No driver assigned.</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm mt-1">
                  <User className="w-6 h-6 text-sk-navy" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Assigned Attendant</h4>
                  {bus.attendant ? (
                    <div>
                      <p className="text-lg font-semibold text-sk-navy">{bus.attendant.user?.name}</p>
                      <p className="text-sm text-gray-500">{bus.attendant.user?.phone} | {bus.attendant.employeeId}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm">No attendant assigned.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetails;
