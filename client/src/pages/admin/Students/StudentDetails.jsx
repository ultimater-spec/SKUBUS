import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Camera, Trash2, User, Phone, Mail, 
  MapPin, Bus, Map, Calendar, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStudentById, deleteStudent } from '../../../services/studentService';
import StatusBadge from '../../../components/ui/StatusBadge';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudent = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStudentById(id);
      if (res.status) {
        setStudent(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student details');
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this student?')) {
      try {
        await deleteStudent(id);
        toast.success('Student deleted successfully');
        navigate('/admin/students');
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete student');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sk-border">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <button onClick={() => navigate('/admin/students')} className="p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors self-start">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative w-24 h-24 rounded-full border-4 border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {student.profileImage ? (
              <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-gray-300" />
            )}
            {student.faceRecognitionEnabled && (
              <div className="absolute bottom-0 w-full bg-sk-success/90 py-0.5 text-center">
                <ShieldCheck className="w-3 h-3 text-white mx-auto" />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left pt-1">
            <h1 className="text-2xl font-bold text-sk-navy mb-1">{student.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2 text-sm text-gray-500">
              <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">ID: {student.studentId}</span>
              <span>•</span>
              <span>Class: {student.className} {student.division}</span>
            </div>
            <StatusBadge status={student.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 md:mt-0">
          <button onClick={() => navigate(`/admin/students/${student._id}/face-registration`)} className="flex items-center gap-2 px-4 py-2 border border-sk-yellow text-sk-navy bg-sk-yellow-background rounded-lg text-sm font-bold hover:bg-sk-yellow-light transition-colors shadow-sm">
            <Camera className="w-4 h-4 text-sk-navy" /> {student.faceRecognitionEnabled ? 'Update Face' : 'Register Face'}
          </button>
          <button onClick={() => navigate(`/admin/students/${student._id}/edit`)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PERSONAL INFO */}
        <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
          <div className="p-4 border-b border-sk-border bg-gray-50/50">
            <h2 className="font-bold text-sk-navy flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Personal Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Full Name</p>
                <p className="font-semibold text-sk-navy">{student.name}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Student ID</p>
                <p className="font-semibold text-sk-navy">{student.studentId}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Date of Birth</p>
                <p className="font-semibold text-sk-navy">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Gender</p>
                <p className="font-semibold text-sk-navy">{student.gender || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Home Address</p>
                <p className="font-medium text-sk-navy flex items-start gap-1">
                  <MapPin className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" /> 
                  {student.address || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PARENT INFO */}
        <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
          <div className="p-4 border-b border-sk-border bg-gray-50/50">
            <h2 className="font-bold text-sk-navy flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Parent Information</h2>
          </div>
          <div className="p-5 space-y-4 text-sm">
            {student.parent ? (
              <>
                <div>
                  <p className="text-gray-500 mb-1">Parent/Guardian Name</p>
                  <p className="font-semibold text-sk-navy">{student.parent.name}</p>
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-sk-navy flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" /> {student.parent.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-sk-navy flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-400" /> {student.parent.email || 'N/A'}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 italic">No parent assigned.</div>
            )}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-gray-500 mb-1">Emergency Contact</p>
              <p className="font-medium text-sk-navy flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-sk-error" /> {student.emergencyContact || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* TRANSPORTATION */}
        <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden">
          <div className="p-4 border-b border-sk-border bg-gray-50/50">
            <h2 className="font-bold text-sk-navy flex items-center gap-2"><Bus className="w-4 h-4 text-gray-400"/> Transportation</h2>
          </div>
          <div className="p-5">
            {student.assignedBus ? (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center p-3 bg-sk-yellow-background rounded-lg border border-sk-yellow/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-sk-yellow p-2 rounded-md">
                      <Bus className="w-5 h-5 text-sk-navy" />
                    </div>
                    <div>
                      <p className="text-xs text-sk-navy/70 font-medium">Assigned Bus</p>
                      <p className="font-bold text-sk-navy text-base">{student.assignedBus.busNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-sk-navy/70 font-medium">Route</p>
                    <p className="font-bold text-sk-navy flex items-center gap-1"><Map className="w-3.5 h-3.5 text-gray-400"/> {student.assignedRoute?.routeName || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Bus className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">No transportation assigned.</p>
              </div>
            )}
          </div>
        </div>

        {/* ATTENDANCE & FACE */}
        <div className="bg-white rounded-2xl shadow-sm border border-sk-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-sk-border bg-gray-50/50">
            <h2 className="font-bold text-sk-navy flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400"/> Attendance & Face Auth</h2>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center gap-6">
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Camera className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="font-semibold text-sk-navy text-sm">Face Registration</p>
                  <p className="text-xs text-gray-500">Biometric boarding status</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge 
                  text={student.faceRecognitionEnabled ? "Registered" : "Not Registered"} 
                  status={student.faceRecognitionEnabled ? "success" : "gray"} 
                />
                <button
                  onClick={() => navigate(`/admin/students/${student._id}/face-registration`)}
                  className="px-3 py-1 text-xs font-bold bg-sk-yellow text-sk-navy rounded-lg hover:bg-sk-yellow-dark transition-colors shadow-sm"
                >
                  {student.faceRecognitionEnabled ? "Update" : "Register"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <p className="text-2xl font-bold text-green-600">85</p>
                <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Present</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <p className="text-2xl font-bold text-red-600">3</p>
                <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Absent</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <p className="text-2xl font-bold text-yellow-600">96%</p>
                <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">Rate</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDetails;
