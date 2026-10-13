import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { createStaff, getStaffById, updateStaff } from '../../../services/staffService';
import { getBuses } from '../../../services/busService';
import { getRoutes } from '../../../services/routeService';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const schema = yup.object().shape({
  name: yup.string().required('Full Name is required'),
  email: yup.string().email('Valid email is required').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  password: yup.string().when('$isEditing', {
    is: false,
    then: () => yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    otherwise: () => yup.string().notRequired(),
  }),
  confirmPassword: yup.string().when('password', (password, schema) => {
    return password && password[0] 
      ? schema.required('Confirm Password is required').oneOf([yup.ref('password')], 'Passwords must match')
      : schema.notRequired();
  }),
  employeeId: yup.string(),
  designation: yup.string().required('Designation is required'),
  assignedBus: yup.string(),
  assignedRoute: yup.string(),
  address: yup.string(),
  emergencyContact: yup.string(),
  status: yup.string().default('active'),
  isActive: yup.boolean().default(true),
});

const StaffForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  
  // We'll fetch buses and routes to populate dropdowns later, but keep it simple for now
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [busRes, routeRes] = await Promise.all([
          getBuses(),
          getRoutes()
        ]);
        if (busRes.status) setBuses(busRes.data);
        if (routeRes.status) setRoutes(routeRes.data);
      } catch (err) {
        console.error('Failed to fetch buses/routes', err);
      }
    };
    fetchOptions();
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    context: { isEditing },
    defaultValues: { isActive: true, status: 'active' }
  });

  const fetchStaff = React.useCallback(async () => {
    try {
      const res = await getStaffById(id);
      if (res.status && res.data) {
        const member = res.data;
        reset({
          name: member.user?.name || '',
          email: member.user?.email || '',
          phone: member.user?.phone || '',
          employeeId: member.employeeId || '',
          designation: member.designation || '',
          assignedBus: member.assignedBus?._id || member.assignedBus || '',
          assignedRoute: member.assignedRoute?._id || member.assignedRoute || '',
          address: member.address || '',
          emergencyContact: member.emergencyContact || '',
          status: member.status || 'active',
          isActive: member.user?.isActive ?? true,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch staff details');
      navigate('/admin/staff');
    } finally {
      setPageLoading(false);
    }
  }, [id, navigate, reset]);

  useEffect(() => {
    if (isEditing) {
      fetchStaff();
    }
  }, [isEditing, fetchStaff]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        const { password: _p, confirmPassword: _cp, ...updateData } = data;
        await updateStaff(id, updateData);
        toast.success('Staff updated successfully');
      } else {
        await createStaff(data);
        toast.success('Staff created successfully');
      }
      navigate('/admin/staff');
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/staff')} className="p-2 bg-white rounded-lg shadow-sm border border-sk-border hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-sk-navy">{isEditing ? 'Edit Staff' : 'Add New Staff'}</h1>
          <p className="text-gray-500 text-sm">Enter the staff's personal and assignment details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Personal & Account Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
              <input type="text" {...register('name')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.name ? 'border-red-300' : 'border-gray-200'}`} placeholder="John Doe" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
              <input type="email" {...register('email')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.email ? 'border-red-300' : 'border-gray-200'}`} placeholder="john@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
              <input type="text" {...register('phone')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.phone ? 'border-red-300' : 'border-gray-200'}`} placeholder="+1 (555) 123-4567" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Active</label>
              <select {...register('isActive')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password (Create Only) */}
        {!isEditing && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
            <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Authentication</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                <input type="password" {...register('password')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.password ? 'border-red-300' : 'border-gray-200'}`} placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password *</label>
                <input type="password" {...register('confirmPassword')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`} placeholder="••••••••" />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Staff Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Staff & Assignment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employee ID</label>
              <input type="text" {...register('employeeId')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" placeholder="EMP001" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation *</label>
              <select {...register('designation')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white ${errors.designation ? 'border-red-300' : 'border-gray-200'}`}>
                <option value="">Select Designation</option>
                <option value="Driver">Driver</option>
                <option value="Conductor">Conductor</option>
                <option value="Attendant">Attendant</option>
                <option value="Coordinator">Coordinator</option>
              </select>
              {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assigned Bus</label>
              <select {...register('assignedBus')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value="">None</option>
                {buses.map(bus => (
                  <option key={bus._id} value={bus._id}>{bus.busNumber} ({bus.registrationNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assigned Route</label>
              <select {...register('assignedRoute')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value="">None</option>
                {routes.map(route => (
                  <option key={route._id} value={route._id}>{route.routeName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Staff Status</label>
              <select {...register('status')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Emergency Contact</label>
              <input type="text" {...register('emergencyContact')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
              <textarea {...register('address')} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none resize-none" placeholder="123 Street Name, City, State, Zip..."></textarea>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <button type="button" onClick={() => navigate('/admin/staff')} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <PrimaryButton type="submit" isLoading={loading} className="px-8 py-2.5 rounded-xl">
            {isEditing ? 'Save Changes' : 'Create Staff'}
          </PrimaryButton>
        </div>

      </form>
    </div>
  );
};

export default StaffForm;
