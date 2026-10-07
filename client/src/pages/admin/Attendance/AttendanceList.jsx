import React, { useState, useEffect } from 'react';
import { Search, Calendar, UserCheck, UserX, Clock, Filter, Bus, Map } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAttendance } from '../../../services/attendanceService';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const AttendanceList = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    status: '',
    type: ''
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAttendance(filters);
      if (res.status) {
        setAttendance(res.data);
      }
    } catch (error) {
      toast.error('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-sk-navy mb-1">Attendance Logs</h1>
          <p className="text-gray-500 font-medium">Monitor student boarding and drop-offs.</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-sk-border flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input 
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="w-full md:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sk-yellow bg-gray-50"
          />
        </div>
        
        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
        
        <select 
          name="status" 
          value={filters.status}
          onChange={handleFilterChange}
          className="w-full md:w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sk-yellow bg-gray-50"
        >
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
        
        <select 
          name="type" 
          value={filters.type}
          onChange={handleFilterChange}
          className="w-full md:w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sk-yellow bg-gray-50"
        >
          <option value="">All Types</option>
          <option value="boarding">Boarding</option>
          <option value="dropoff">Drop-off</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-sk-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-sk-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading logs...
          </div>
        ) : attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-sk-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Time</th>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Bus / Route</th>
                  <th className="px-6 py-4 font-semibold">Method</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {log.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          {log.student?.user?.profileImage ? (
                            <img src={log.student.user.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs bg-gray-100">
                              {log.student?.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sk-navy">{log.student?.name}</p>
                          <p className="text-xs text-gray-500">{log.student?.studentId} • {log.student?.className}-{log.student?.division}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.type === 'boarding' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Boarding
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Drop-off
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                         {log.bus && (
                           <div className="flex items-center gap-1 text-gray-600"><Bus className="w-3 h-3"/> {log.bus.busNumber}</div>
                         )}
                         {log.route && (
                           <div className="flex items-center gap-1 text-gray-500"><Map className="w-3 h-3"/> {log.route.routeName}</div>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 capitalize">{log.method.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'present' && <span className="inline-flex items-center gap-1 text-green-600 font-medium"><UserCheck className="w-4 h-4"/> Present</span>}
                      {log.status === 'absent' && <span className="inline-flex items-center gap-1 text-red-600 font-medium"><UserX className="w-4 h-4"/> Absent</span>}
                      {log.status === 'late' && <span className="inline-flex items-center gap-1 text-yellow-600 font-medium"><Clock className="w-4 h-4"/> Late</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="bg-gray-50 p-6 rounded-full mb-4 text-gray-400">
              <UserCheck className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-sk-navy mb-2">No logs found</h3>
            <p className="text-gray-500 max-w-sm mb-6">No attendance records match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;
