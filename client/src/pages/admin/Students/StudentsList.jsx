import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Filter, MoreVertical, Eye, Edit, Trash2, Camera, User, Bus, Map 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStudents, deleteStudent } from '../../../services/studentService';
import StatusBadge from '../../../components/ui/StatusBadge';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const StudentsList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await getStudents();
      if (res.status) {
        setStudents(res.data);
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load students';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const res = await deleteStudent(id);
        if (res.status) {
          toast.success('Student deleted successfully');
          setStudents(students.filter(s => s._id !== id));
        }
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Failed to delete student';
        toast.error(message);
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesClass = classFilter ? student.className === classFilter : true;
    const matchesStatus = statusFilter ? student.status === statusFilter : true;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Students</h1>
          <p className="text-gray-500 font-medium">Manage student information, transportation assignments, and attendance profiles.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => navigate('/admin/students/face-registration')} 
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-sk-yellow bg-sk-yellow-background text-sk-navy font-bold rounded-xl hover:bg-sk-yellow-light transition-all shadow-sm"
          >
            <Camera className="w-5 h-5 text-sk-navy" /> Register Student Face
          </button>
          <PrimaryButton onClick={() => navigate('/admin/students/create')} className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Student
          </PrimaryButton>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-sk-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sk-yellow bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Filter className="w-4 h-4" /> Filters:
          </div>
          <select 
            className="border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sk-yellow bg-white"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            <option value="1A">1A</option>
            <option value="2B">2B</option>
            <option value="3C">3C</option>
          </select>
          <select 
            className="border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sk-yellow bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-sk-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading students...
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-sk-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Class</th>
                  <th className="px-6 py-4 font-semibold">Parent</th>
                  <th className="px-6 py-4 font-semibold">Transport</th>
                  <th className="px-6 py-4 font-semibold">Face Recognition</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {student.profileImage ? (
                          <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sk-navy">{student.name}</p>
                        <p className="text-xs text-gray-500">ID: {student.studentId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{student.className || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{student.parent?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      {student.assignedBus ? (
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 text-xs font-medium text-sk-navy"><Bus className="w-3 h-3"/> {student.assignedBus?.busNumber || '-'}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Map className="w-3 h-3"/> {student.assignedRoute?.routeName || '-'}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.faceRecognitionEnabled ? (
                        <StatusBadge text="Registered" status="success" />
                      ) : (
                        <StatusBadge text="Not Registered" status="gray" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/admin/students/${student._id}/face-registration`)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg tooltip" title="Register Face">
                          <Camera className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/admin/students/${student._id}`)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg tooltip" title="View Profile">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/admin/students/${student._id}/edit`)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg tooltip" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(student._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg tooltip" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="md:hidden">
                         <MoreVertical className="w-5 h-5 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="bg-gray-50 p-6 rounded-full mb-4 text-gray-400">
              <User className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-sk-navy mb-2">No students yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">Add your first student to start managing transportation and attendance.</p>
            <PrimaryButton onClick={() => navigate('/admin/students/create')} className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Student
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsList;
