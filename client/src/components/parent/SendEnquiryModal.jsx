import React, { useState, useEffect } from 'react';
import { X, Send, Briefcase, User, Bus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEnquiry } from '../../services/enquiryService';
import PrimaryButton from '../ui/PrimaryButton';

const CATEGORIES = [
  'Bus Timing',
  'Pickup / Dropoff',
  'Lost Item',
  'Student Conduct',
  'Health / Safety',
  'General Enquiry',
  'Other'
];

const SendEnquiryModal = ({ isOpen, onClose, assignedStaff = [], students = [], initialStaffId = '', onSuccess }) => {
  const [formData, setFormData] = useState({
    staffId: '',
    studentId: '',
    subject: '',
    category: 'Bus Timing',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        staffId: initialStaffId || (assignedStaff.length > 0 ? assignedStaff[0]._id : ''),
        studentId: students.length > 0 ? students[0]._id : '',
        subject: '',
        category: 'Bus Timing',
        message: ''
      }));
    }
  }, [isOpen, initialStaffId, assignedStaff, students]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.staffId) {
      toast.error('Please select an assigned staff member');
      return;
    }
    if (!formData.studentId) {
      toast.error('Please select the relevant student');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('Please enter an enquiry subject');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your enquiry message');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createEnquiry({
        staffId: formData.staffId,
        studentId: formData.studentId,
        subject: formData.subject.trim(),
        category: formData.category,
        message: formData.message.trim()
      });

      if (res.status) {
        toast.success(`Enquiry sent successfully! Reference: ${res.data?.enquiryId || 'Registered'}`);
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        toast.error(res.message || 'Failed to send enquiry');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send staff enquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStaffObj = assignedStaff.find(s => s._id === formData.staffId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sk-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-sk-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-sk-yellow-background border-b border-sk-yellow/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sk-yellow text-sk-navy flex items-center justify-center shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sk-navy">Staff Enquiry</h2>
              <p className="text-xs text-gray-600">Send an in-app enquiry to staff directly responsible for your child.</p>
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
          
          {/* Staff Selector */}
          <div>
            <label className="block text-sm font-semibold text-sk-navy mb-1.5">
              Assigned Staff Member <span className="text-red-500">*</span>
            </label>
            {assignedStaff.length > 0 ? (
              <select
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow text-sm font-medium"
                required
              >
                {assignedStaff.map(st => (
                  <option key={st._id} value={st._id}>
                    {st.name} — {st.designation} ({st.assignedBus || 'Bus'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                No staff members currently assigned to your child's bus or route. You can submit a support ticket to the school administrator instead.
              </div>
            )}
            
            {selectedStaffObj && (
              <div className="mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-sk-yellow-dark" /> {selectedStaffObj.name} ({selectedStaffObj.designation})
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Bus className="w-3.5 h-3.5" /> {selectedStaffObj.assignedBus}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Related Student */}
            <div>
              <label className="block text-sm font-semibold text-sk-navy mb-1.5">
                Related Student <span className="text-red-500">*</span>
              </label>
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
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-sk-navy mb-1.5">
                Enquiry Category <span className="text-red-500">*</span>
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
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-sk-navy mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. Expected arrival time at stop today"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sk-yellow text-sm"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-sk-navy mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Write your enquiry message clearly to the assigned staff member..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
              disabled={assignedStaff.length === 0}
              isLoading={isSubmitting}
            >
              Send Enquiry
            </PrimaryButton>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SendEnquiryModal;
