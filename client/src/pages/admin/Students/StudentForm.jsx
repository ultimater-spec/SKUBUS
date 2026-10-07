import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Camera, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { createStudent, getStudentById, updateStudent } from '../../../services/studentService';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const schema = yup.object().shape({
  name: yup.string().required('Full Name is required'),
  studentId: yup.string().required('Student ID is required'),
  className: yup.string().required('Class is required'),
  dateOfBirth: yup.string(),
  gender: yup.string(),
  division: yup.string(),
  emergencyContact: yup.string(),
  address: yup.string(),
  status: yup.string().default('active'),
  // Since we don't have parents/buses APIs yet in this scope, making them optional strings
  parent: yup.string(),
  assignedBus: yup.string(),
  assignedRoute: yup.string(),
});

const StudentForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { status: 'active' }
  });

  const fetchStudent = React.useCallback(async () => {
    try {
      const res = await getStudentById(id);
      if (res.status && res.data) {
        const student = res.data;
        // Format date for input
        const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '';
        reset({
          ...student,
          dateOfBirth: dob,
          parent: student.parent?._id || '',
          assignedBus: student.assignedBus?._id || '',
          assignedRoute: student.assignedRoute?._id || ''
        });
        if (student.profileImage) {
          setPhotoPreview(student.profileImage);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch student details');
      navigate('/admin/students');
    } finally {
      setPageLoading(false);
    }
  }, [id, navigate, reset]);

  useEffect(() => {
    if (isEditing) {
      fetchStudent();
    }
  }, [isEditing, fetchStudent]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG and WEBP are allowed');
      return;
    }

    // In a real app, you would upload this file to S3/Cloudinary and get a URL.
    // For now, we generate a local blob URL for preview and simulate an image URL.
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    // Pretend we uploaded it and got a real URL back to save in DB
    setValue('profileImage', `https://ui-avatars.com/api/?name=${file.name}&background=random`);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await updateStudent(id, data);
        toast.success('Student updated successfully');
      } else {
        await createStudent(data);
        toast.success('Student created successfully');
      }
      navigate('/admin/students');
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
        <button onClick={() => navigate('/admin/students')} className="p-2 bg-white rounded-lg shadow-sm border border-sk-border hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-sk-navy">{isEditing ? 'Edit Student' : 'Add New Student'}</h1>
          <p className="text-gray-500 text-sm">Enter the student's personal, academic, and transportation details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Photo Upload Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Student Photo</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 rounded-full border-4 border-gray-100 bg-gray-50 flex flex-col items-center justify-center overflow-hidden shrink-0 group">
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <User className="w-12 h-12 text-gray-300 mb-1" />
                  <span className="text-[10px] text-gray-400 font-medium">No Photo</span>
                </>
              )}
              <input type="file" accept="image/jpeg, image/png, image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-gray-700">Upload profile picture</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">JPG, PNG or WEBP. Max size 2MB.</p>
              <div className="flex gap-2 justify-center sm:justify-start">
                <button type="button" className="relative px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                  <span>Choose File</span>
                  <input type="file" accept="image/jpeg, image/png, image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
                </button>
                {photoPreview && (
                  <button type="button" onClick={() => { setPhotoPreview(null); setValue('profileImage', ''); }} className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
              <input type="text" {...register('name')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.name ? 'border-red-300' : 'border-gray-200'}`} placeholder="Jane Doe" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student ID *</label>
              <input type="text" {...register('studentId')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.studentId ? 'border-red-300' : 'border-gray-200'}`} placeholder="STU-2026-001" />
              {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
              <input type="date" {...register('dateOfBirth')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
              <select {...register('gender')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class *</label>
              <input type="text" {...register('className')} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none ${errors.className ? 'border-red-300' : 'border-gray-200'}`} placeholder="e.g. 10th Grade" />
              {errors.className && <p className="text-red-500 text-xs mt-1">{errors.className.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Division/Section</label>
              <input type="text" {...register('division')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" placeholder="e.g. A" />
            </div>
          </div>
        </div>

        {/* Contact & Transport */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <h2 className="text-lg font-bold text-sk-navy mb-4 border-b pb-2">Parent & Transportation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Emergency Contact</label>
              <input type="text" {...register('emergencyContact')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none" placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select {...register('status')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none bg-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Home Address</label>
              <textarea {...register('address')} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sk-yellow outline-none resize-none" placeholder="123 School Lane..."></textarea>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
          <button type="button" onClick={() => navigate('/admin/students')} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <PrimaryButton type="submit" isLoading={loading} className="px-8 py-2.5 rounded-xl">
            {isEditing ? 'Save Changes' : 'Create Student'}
          </PrimaryButton>
        </div>

      </form>
    </div>
  );
};

export default StudentForm;
