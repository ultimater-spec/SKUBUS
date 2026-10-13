import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Map, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createRoute, getRouteById, updateRoute } from '../../../services/routeService';
import { getBuses } from '../../../services/busService';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const stopSchema = yup.object().shape({
  stopName: yup.string().required('Stop Name is required'),
  location: yup.string(),
  pickupTime: yup.string(),
  dropTime: yup.string(),
  order: yup.number().default(0),
});

const schema = yup.object().shape({
  routeName: yup.string().required('Route Name is required'),
  routeNumber: yup.string().required('Route Number is required'),
  startingPoint: yup.string().required('Starting Point is required'),
  destination: yup.string().required('Destination is required'),
  estimatedDuration: yup.number().nullable(),
  assignedBus: yup.string(),
  status: yup.string().default('active'),
  stops: yup.array().of(stopSchema),
});

const RouteForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const busRes = await getBuses();
        if (busRes.status) setBuses(busRes.data);
      } catch (err) {
        console.error('Failed to fetch buses', err);
      }
    };
    fetchOptions();
  }, []);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { status: 'active', stops: [] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stops'
  });

  const fetchRoute = React.useCallback(async () => {
    try {
      const res = await getRouteById(id);
      if (res.status && res.data) {
        const route = res.data;
        reset({
          routeName: route.routeName || '',
          routeNumber: route.routeNumber || '',
          startingPoint: route.startingPoint || '',
          destination: route.destination || '',
          estimatedDuration: route.estimatedDuration || null,
          assignedBus: route.assignedBus?._id || route.assignedBus || '',
          status: route.status || 'active',
          stops: route.stops || [],
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch route details');
      navigate('/admin/routes');
    } finally {
      setPageLoading(false);
    }
  }, [id, navigate, reset]);

  useEffect(() => {
    if (isEditing) {
      fetchRoute();
    }
  }, [isEditing, fetchRoute]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    // Ensure stop order is correct before submitting
    data.stops = data.stops.map((stop, idx) => ({ ...stop, order: idx + 1 }));

    try {
      if (isEditing) {
        await updateRoute(id, data);
        toast.success('Route updated successfully');
      } else {
        await createRoute(data);
        toast.success('Route created successfully');
      }
      navigate('/admin/routes');
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
        <button onClick={() => navigate('/admin/routes')} className="p-2 bg-white rounded-lg shadow-sm border border-sk-border hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-sk-navy">{isEditing ? 'Edit Route' : 'Add New Route'}</h1>
          <p className="text-gray-500 text-sm">Enter route details and define stops.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Route Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2 flex items-center gap-2">
            <Map className="w-5 h-5" /> Route Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Route Name *</label>
              <input type="text" {...register('routeName')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.routeName ? 'border-red-300' : 'border-gray-200'}`} placeholder="e.g., North City Route" />
              {errors.routeName && <p className="text-red-500 text-xs mt-1">{errors.routeName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Route Number *</label>
              <input type="text" {...register('routeNumber')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.routeNumber ? 'border-red-300' : 'border-gray-200'}`} placeholder="e.g., R-01" />
              {errors.routeNumber && <p className="text-red-500 text-xs mt-1">{errors.routeNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Starting Point *</label>
              <input type="text" {...register('startingPoint')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.startingPoint ? 'border-red-300' : 'border-gray-200'}`} placeholder="e.g., Downtown" />
              {errors.startingPoint && <p className="text-red-500 text-xs mt-1">{errors.startingPoint.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Destination *</label>
              <input type="text" {...register('destination')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.destination ? 'border-red-300' : 'border-gray-200'}`} placeholder="e.g., School Campus" />
              {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estimated Duration (mins)</label>
              <input type="number" {...register('estimatedDuration')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" placeholder="e.g., 45" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select {...register('status')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bus Assignment */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Bus Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assigned Bus</label>
              <select {...register('assignedBus')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value="">None</option>
                {buses.map(bus => (
                  <option key={bus._id} value={bus._id}>{bus.busNumber} ({bus.registrationNumber})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stops */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-sk-navy">Route Stops</h2>
            <button 
              type="button" 
              onClick={() => append({ stopName: '', location: '', pickupTime: '', dropTime: '' })}
              className="flex items-center gap-1 text-sm text-sk-yellow font-medium bg-sk-yellow/10 px-3 py-1.5 rounded-lg hover:bg-sk-yellow/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Stop
            </button>
          </div>
          
          <div className="space-y-4">
            {fields.length === 0 ? (
              <p className="text-gray-400 italic text-sm text-center py-4">No stops added yet.</p>
            ) : (
              fields.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-xl relative bg-gray-50/50">
                  <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-sk-navy text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="absolute right-3 top-3 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Stop Name *</label>
                      <input 
                        {...register(`stops.${index}.stopName`)} 
                        className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.stops?.[index]?.stopName ? 'border-red-300' : 'border-gray-200'}`} 
                        placeholder="e.g., Main Street Junction" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Location/Landmark</label>
                      <input 
                        {...register(`stops.${index}.location`)} 
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" 
                        placeholder="e.g., Near City Mall" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Pickup Time (Morning)</label>
                      <input 
                        type="time"
                        {...register(`stops.${index}.pickupTime`)} 
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Drop Time (Afternoon)</label>
                      <input 
                        type="time"
                        {...register(`stops.${index}.dropTime`)} 
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" 
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <button type="button" onClick={() => navigate('/admin/routes')} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <PrimaryButton type="submit" isLoading={loading} className="px-8 py-2.5 rounded-xl">
            {isEditing ? 'Save Changes' : 'Create Route'}
          </PrimaryButton>
        </div>

      </form>
    </div>
  );
};

export default RouteForm;
