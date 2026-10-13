import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createComplaint } from '../../services/complaintService';
import PrimaryButton from '../ui/PrimaryButton';

const CATEGORIES = [
  'Bus',
  'Driver',
  'Staff',
  'Route',
  'Student Safety',
  'Attendance',
  'Other'
];

const PRIORITIES = [
  { value: 'normal', label: 'Normal', desc: 'Standard response within 24h', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { value: 'high', label: 'High', desc: 'Important issue needing attention', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { value: 'urgent', label: 'Urgent', desc: 'Critical safety or urgent transport issue', color: 'bg-red-50 border-red-200 text-red-800' }
];

const RaiseComplaintModal = ({ isOpen, onClose, students = [], onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Bus',
    studentId: students.length > 0 ? students[0]._id : '',
    priority: 'normal',
    description: '',
    attachment: ''
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      setFileError('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, attachment: reader.result }));
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setFormData(prev => ({ ...prev, attachment: '' }));
    setPreviewUrl('');
    setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a complaint title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a detailed description of the complaint');
      return;
    }
    if (students.length > 0 && !formData.studentId) {
      toast.error('Please select the related student');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createComplaint({
        title: formData.title.trim(),
        subject: formData.title.trim(),
        category: formData.category,
        studentId: formData.studentId || undefined,
        priority: formData.priority,
        description: formData.description.trim(),
        attachment: formData.attachment || undefined
      });

      if (res.status) {
        toast.success(`Complaint submitted successfully! Reference: ${res.data?.complaintId || 'Registered'}`);
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        toast.error(res.message || 'Failed to submit complaint');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sk-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-sk-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-sk-yellow-background border-b border-sk-yellow/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sk-yellow text-sk-navy flex items-center justify-center shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sk-navy">Raise a Complaint</h2>
              <p className="text-xs text-gray-600">Submit an official complaint directly to the school transport administration.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-sk-navy hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Complaint Title */}
          <div>
            <label className="block text-sm font-semibold text-sk-navy mb-1.5">
              Complaint Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. Bus arrived 30 minutes late at morning pickup"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-sk-navy mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow text-sm font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Related Student */}
            <div>
              <label className="block text-sm font-semibold text-sk-navy mb-1.5">
                Related Student <span className="text-red-500">*</span>
              </label>
              {students.length > 0 ? (
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow text-sm font-medium"
                  required
                >
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.className ? `Class ${s.className}-${s.division || ''}` : s.studentId})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  No student records linked to your account.
                </p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-sk-navy mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIORITIES.map(p => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setFormData({ ...formData, priority: p.value })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.priority === p.value 
                      ? `${p.color} ring-2 ring-sk-navy/20 font-semibold shadow-sm` 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold capitalize">{p.label}</span>
                    {formData.priority === p.value && <CheckCircle className="w-4 h-4 text-sk-navy" />}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-sm font-semibold text-sk-navy mb-1.5">
              Complaint Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide specific details including time, date, bus number, location, and what occurred..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow text-sm resize-y"
              required
            ></textarea>
          </div>

          {/* Optional Image Attachment */}
          <div>
            <label className="block text-sm font-semibold text-sk-navy mb-1.5">
              Attachment <span className="text-gray-400 font-normal">(Optional, max 2MB)</span>
            </label>
            
            {previewUrl ? (
              <div className="relative inline-block border-2 border-sk-yellow/40 rounded-xl p-2 bg-yellow-50/50">
                <img 
                  src={previewUrl} 
                  alt="Attachment preview" 
                  className="w-32 h-32 object-cover rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 hover:border-sk-yellow rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-yellow-50/30">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs font-semibold text-gray-700">Click to upload photo evidence</span>
                <span className="text-[11px] text-gray-400">PNG, JPG or WEBP (Max 2MB)</span>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>
            )}
            {fileError && (
              <p className="text-xs text-red-500 mt-1 font-medium">{fileError}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton 
              type="submit" 
              isLoading={isSubmitting}
            >
              Submit Complaint
            </PrimaryButton>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RaiseComplaintModal;
