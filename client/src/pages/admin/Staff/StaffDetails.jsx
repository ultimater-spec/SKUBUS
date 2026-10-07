import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Briefcase, Mail, Phone, MapPin, Calendar, Clock, Bus, Map, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStaffById } from '../../../services/staffService';
import StatusBadge from '../../../components/ui/StatusBadge';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import moment from 'moment';

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await getStaffById(id);
        if (res.status && res.data) {
          setStaff(res.data);
        }
      } catch (error) {
        toast.error('Failed to load staff details');
        navigate('/admin/staff');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!staff) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/staff')} className="p-2 bg-white rounded-lg shadow-sm border border-sk-border hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Staff Profile</h1>
            <p className="text-gray-500 font-medium">View detailed staff information</p>
          </div>
        </div>
        <PrimaryButton onClick={() => navigate(`/admin/staff/${id}/edit`)} className="flex items-center gap-2">
          <Edit className="w-5 h-5" /> Edit Staff
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-sk-navy to-sk-navy-light"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md absolute -top-10 flex items-center justify-center overflow-hidden">
                {staff.user?.profileImage ? (
                  <img src={staff.user.profileImage} alt={staff.user.name} className="w-full h-full object-cover" />
                ) : (
                  <Briefcase className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="mt-12">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-sk-navy">{staff.user?.name}</h2>
                    <p className="text-gray-500 text-sm font-medium">{staff.designation || 'Staff'}</p>
                  </div>
                  <StatusBadge status={staff.status === 'active' && staff.user?.isActive ? 'active' : 'inactive'} />
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Staff ID</p>
                      <p className="font-medium text-gray-800">{staff.staffId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Employee ID</p>
                      <p className="font-medium text-gray-800">{staff.employeeId || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Joining Date</p>
                      <p className="font-medium text-gray-800">
                        {staff.joiningDate ? moment(staff.joiningDate).format('MMM DD, YYYY') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CONTACT INFO */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border p-6">
            <h3 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Email Address</p>
                  <p className="text-gray-800 font-medium">{staff.user?.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Phone Number</p>
                  <p className="text-gray-800 font-medium">{staff.user?.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Emergency Contact</p>
                  <p className="text-gray-800 font-medium">{staff.emergencyContact || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Address</p>
                  <p className="text-gray-800 font-medium">{staff.address || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ASSIGNMENTS */}
          <div className="bg-white rounded-2xl shadow-sm border border-sk-border p-6">
            <h3 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Current Assignments</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Bus className="w-5 h-5 text-sk-navy" />
                  </div>
                  <h4 className="font-bold text-gray-800">Assigned Bus</h4>
                </div>
                {staff.assignedBus ? (
                  <div>
                    <p className="text-xl font-bold text-sk-navy">{staff.assignedBus.busNumber}</p>
                    <p className="text-sm text-gray-500">{staff.assignedBus.registrationNumber}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">No bus assigned</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Map className="w-5 h-5 text-sk-navy" />
                  </div>
                  <h4 className="font-bold text-gray-800">Assigned Route</h4>
                </div>
                {staff.assignedRoute ? (
                  <div>
                    <p className="text-xl font-bold text-sk-navy">{staff.assignedRoute.routeName}</p>
                    <p className="text-sm text-gray-500">Route #{staff.assignedRoute.routeNumber}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">No route assigned</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffDetails;
