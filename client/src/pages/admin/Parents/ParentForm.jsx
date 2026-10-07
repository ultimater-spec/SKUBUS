import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { createParent, getParentById, updateParent } from '../../../services/parentService';
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
  address: yup.string(),
  emergencyContact: yup.string(),
  isActive: yup.boolean().default(true),
});

const ParentForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    context: { isEditing },
    defaultValues: { isActive: true }
  });

  const fetchParent = React.useCallback(async () => {
    try {
      const res = await getParentById(id);
      if (res.status && res.data) {
        const parent = res.data;
        reset({
          name: parent.user?.name || '',
          email: parent.user?.email || '',
          phone: parent.user?.phone || '',
          address: parent.address || '',
          emergencyContact: parent.emergencyContact || '',
          isActive: parent.user?.isActive ?? true,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch parent details');
      navigate('/admin/parents');
    } finally {
      setPageLoading(false);
    }
  }, [id, navigate, reset]);

  useEffect(() => {
    if (isEditing) {
      fetchParent();
    }
  }, [isEditing, fetchParent]);



  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        // Exclude passwords when editing since we don't manage it here currently
        const { password: _p, confirmPassword: _cp, ...updateData } = data;
        await updateParent(id, updateData);
        toast.success('Parent updated successfully');
      } else {
        await createParent(data);
        toast.success('Parent created successfully');
      }
      navigate('/admin/parents');
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
        <button onClick={() => navigate('/admin/parents')} className="p-2 bg-white rounded-lg shadow-sm border border-sk-border hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-sk-navy">{isEditing ? 'Edit Parent' : 'Add New Parent'}</h1>
          <p className="text-gray-500 text-sm">Enter the parent's personal and contact details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Personal & Account Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2 flex items-center gap-2">
            <User className="w-5 h-5" /> Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
              <input type="text" {...register('name')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.name ? 'border-red-300' : 'border-gray-200'}`} placeholder="Jane Doe" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
              <input type="email" {...register('email')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.email ? 'border-red-300' : 'border-gray-200'}`} placeholder="jane@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
              <input type="text" {...register('phone')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.phone ? 'border-red-300' : 'border-gray-200'}`} placeholder="+1 (555) 123-4567" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select {...register('isActive')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
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

        {/* Additional Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Emergency Contact</label>
              <input type="text" {...register('emergencyContact')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Home Address</label>
              <textarea {...register('address')} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none resize-none" placeholder="123 Street Name, City, State, Zip..."></textarea>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <button type="button" onClick={() => navigate('/admin/parents')} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <PrimaryButton type="submit" isLoading={loading} className="px-8 py-2.5 rounded-xl">
            {isEditing ? 'Save Changes' : 'Create Parent'}
          </PrimaryButton>
        </div>

      </form>
    </div>
  );
};

export default ParentForm;
