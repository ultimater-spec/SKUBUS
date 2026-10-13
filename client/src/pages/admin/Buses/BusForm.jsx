import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Bus as BusIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { createBus, getBusById, updateBus } from '../../../services/busService';
import { getStaff } from '../../../services/staffService';
import { getRoutes } from '../../../services/routeService';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const schema = yup.object().shape({
  busNumber: yup.string().required('Bus Number is required'),
  registrationNumber: yup.string().required('Registration Number is required'),
  capacity: yup.number().positive('Capacity must be positive').integer().required('Capacity is required'),
  driver: yup.string(),
  attendant: yup.string(),
  assignedRoute: yup.string(),
  status: yup.string().default('active'),
  model: yup.string(),
  year: yup.number().nullable(),
});

const BusForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  
  const [staff, setStaff] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [staffRes, routeRes] = await Promise.all([
          getStaff(),
          getRoutes()
        ]);
        if (staffRes.status) setStaff(staffRes.data);
        if (routeRes.status) setRoutes(routeRes.data);
      } catch (err) {
        console.error('Failed to fetch staff/routes', err);
      }
    };
    fetchOptions();
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { status: 'active' }
  });

  const fetchBus = React.useCallback(async () => {
    try {
      const res = await getBusById(id);
      if (res.status && res.data) {
        const bus = res.data;
        reset({
          busNumber: bus.busNumber || '',
          registrationNumber: bus.registrationNumber || '',
          capacity: bus.capacity || '',
          driver: bus.driver?._id || bus.driver || '',
          attendant: bus.attendant?._id || bus.attendant || '',
          assignedRoute: bus.assignedRoute?._id || bus.assignedRoute || '',
          status: bus.status || 'active',
          model: bus.model || '',
          year: bus.year || null,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch bus details');
      navigate('/admin/buses');
    } finally {
      setPageLoading(false);
    }
  }, [id, navigate, reset]);

  useEffect(() => {
    if (isEditing) {
      fetchBus();
    }
  }, [isEditing, fetchBus]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await updateBus(id, data);
        toast.success('Bus updated successfully');
      } else {
        await createBus(data);
        toast.success('Bus created successfully');
      }
      navigate('/admin/buses');
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

  const drivers = staff.filter(s => s.designation === 'Driver');
  const attendants = staff.filter(s => s.designation !== 'Driver');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/buses')} className="p-2 bg-white rounded-lg shadow-sm border border-sk-border hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-sk-navy">{isEditing ? 'Edit Bus' : 'Add New Bus'}</h1>
          <p className="text-gray-500 text-sm">Enter the bus details and assignments.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Bus Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2 flex items-center gap-2">
            <BusIcon className="w-5 h-5" /> Bus Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bus Number *</label>
              <input type="text" {...register('busNumber')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.busNumber ? 'border-red-300' : 'border-gray-200'}`} placeholder="e.g., B-01" />
              {errors.busNumber && <p className="text-red-500 text-xs mt-1">{errors.busNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Registration Number *</label>
              <input type="text" {...register('registrationNumber')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.registrationNumber ? 'border-red-300' : 'border-gray-200'}`} placeholder="e.g., XY-12-AB-3456" />
              {errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Capacity *</label>
              <input type="number" {...register('capacity')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.capacity ? 'border-red-300' : 'border-gray-200'}`} placeholder="e.g., 40" />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select {...register('status')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Model</label>
              <input type="text" {...register('model')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" placeholder="e.g., Tata Starbus" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Manufacturing Year</label>
              <input type="number" {...register('year')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" placeholder="e.g., 2022" />
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Assignments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assigned Driver</label>
              <select {...register('driver')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value="">None</option>
                {drivers.map(s => (
                  <option key={s._id} value={s._id}>{s.user?.name} ({s.staffId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assigned Attendant</label>
              <select {...register('attendant')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value="">None</option>
                {attendants.map(s => (
                  <option key={s._id} value={s._id}>{s.user?.name} ({s.staffId})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <button type="button" onClick={() => navigate('/admin/buses')} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <PrimaryButton type="submit" isLoading={loading} className="px-8 py-2.5 rounded-xl">
            {isEditing ? 'Save Changes' : 'Create Bus'}
          </PrimaryButton>
        </div>

      </form>
    </div>
  );
};

export default BusForm;
