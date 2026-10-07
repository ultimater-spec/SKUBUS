import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  
  getAttendanceOverview: async () => {
    const response = await api.get('/admin/dashboard/attendance-overview');
    return response.data;
  },
  
  getRecentAttendance: async () => {
    const response = await api.get('/admin/dashboard/recent-attendance');
    return response.data;
  },
  
  getRecentComplaints: async () => {
    const response = await api.get('/admin/dashboard/recent-complaints');
    return response.data;
  },
  
  getNotifications: async () => {
    const response = await api.get('/admin/dashboard/notifications');
    return response.data;
  },
  
  getBusOverview: async () => {
    const response = await api.get('/admin/dashboard/buses');
    return response.data;
  }
};
