import React, { useState } from 'react';
import { X, MessageSquare, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createTicket } from '../../services/ticketService';
import PrimaryButton from '../ui/PrimaryButton';

const CATEGORIES = [
  'General',
  'Bus Tracking',
  'Fee / Billing',
  'Schedule',
  'Student Safety',
  'Attendance',
  'Other'
];

const PRIORITIES = [
  { value: 'normal', label: 'Normal', desc: 'General queries or updates' },
  { value: 'high', label: 'High', desc: 'Urgent schedule or route change' },
  { value: 'urgent', label: 'Urgent', desc: 'Critical assistance required' }
];

const CreateTicketModal = ({ isOpen, onClose, students = [], onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'General',
    studentId: students.length > 0 ? students[0]._id : '',
    priority: 'normal',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error('Please enter a ticket subject');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description for your support request');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTicket({
        subject: formData.subject.trim(),
        category: formData.category,
        studentId: formData.studentId || undefined,
        priority: formData.priority,
        description: formData.description.trim()
      });

      if (res.status) {
        toast.success(`Support ticket created successfully! Reference: ${res.data?.ticketId || 'Created'}`);
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        toast.error(res.message || 'Failed to create ticket');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sk-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-sk-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-sk-yellow-background border-b border-sk-yellow/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sk-yellow text-sk-navy flex items-center justify-center shadow-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sk-navy">Create Support Ticket</h2>
              <p className="text-xs text-gray-600">Open a direct support conversation with school bus administrators.</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-sk-navy mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. Inquire about stop change near lakeview road"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                Related Student <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow text-sm font-medium"
              >
                <option value="">General (None)</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.className ? `Class ${s.className}` : s.studentId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-sk-navy mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {PRIORITIES.map(p => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setFormData({ ...formData, priority: p.value })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    formData.priority === p.value 
                      ? 'border-sk-yellow-dark bg-sk-yellow-background ring-2 ring-sk-yellow text-sk-navy font-semibold' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold capitalize">{p.label}</span>
                    {formData.priority === p.value && <CheckCircle className="w-3.5 h-3.5 text-sk-yellow-dark" />}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Message */}
          <div>
            <label className="block text-sm font-semibold text-sk-navy mb-1.5">
              Description / Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe your question or support request clearly..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow text-sm resize-y"
              required
            ></textarea>
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
              Create Ticket
            </PrimaryButton>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
