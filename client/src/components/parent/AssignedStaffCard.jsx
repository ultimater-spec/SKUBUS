import React from 'react';
import { User, Phone, MessageSquare, Bus, MapPin, Mail, AlertCircle, Shield } from 'lucide-react';

const AssignedStaffCard = ({ staffList = [], onSendEnquiry, onContactAdmin }) => {
  if (!staffList || staffList.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-sk-border shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-sk-navy mb-2">No Staff Currently Assigned</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          There are currently no transport staff members assigned to your child's bus or route records. If you need assistance, please contact the school administration directly.
        </p>
        <button
          onClick={onContactAdmin}
          className="px-6 py-2.5 bg-sk-yellow hover:bg-sk-yellow-dark text-sk-navy font-bold rounded-xl text-sm transition shadow-sm inline-flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" /> Contact Administration
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {staffList.map((staff) => (
        <div 
          key={staff._id || staff.staffId}
          className="bg-white rounded-2xl p-5 border border-sk-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            {/* Header / Avatar */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sk-navy text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {staff.profileImage ? (
                    <img src={staff.profileImage} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    staff.name?.charAt(0)?.toUpperCase() || 'S'
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sk-navy text-base">{staff.name}</h4>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sk-yellow-light text-sk-navy border border-sk-yellow/30 mt-0.5">
                    {staff.designation || 'Transport Staff'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Shield className="w-3 h-3" /> Verified Staff
              </div>
            </div>

            {/* Assignments */}
            <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <Bus className="w-3.5 h-3.5 text-sk-navy" /> Assigned Bus:
                </span>
                <span className="font-bold text-sk-navy">{staff.assignedBus || 'Bus Fleet'}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-sk-navy" /> Route:
                </span>
                <span className="font-bold text-sk-navy truncate max-w-[200px]" title={staff.assignedRoute}>
                  {staff.assignedRoute || 'Assigned Route'}
                </span>
              </div>
              {staff.students && staff.students.length > 0 && (
                <div className="flex items-center justify-between text-gray-700 pt-1 border-t border-gray-200/60">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <User className="w-3.5 h-3.5 text-sk-navy" /> For Student:
                  </span>
                  <span className="font-semibold text-sk-navy">
                    {staff.students.map(s => s.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onSendEnquiry(staff._id)}
              className="flex-1 py-2 px-3 bg-sk-yellow hover:bg-sk-yellow-dark text-sk-navy font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Send Enquiry
            </button>

            {staff.phone ? (
              <a
                href={`tel:${staff.phone}`}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                title={`Call ${staff.name}`}
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignedStaffCard;
