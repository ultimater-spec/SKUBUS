import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Staff from '../models/Staff.js';
import Bus from '../models/Bus.js';
import Attendance from '../models/Attendance.js';
import Complaint from '../models/Complaint.js';
import Ticket from '../models/Ticket.js';
import StaffEnquiry from '../models/StaffEnquiry.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalParents = await Parent.countDocuments();
    const totalStaff = await Staff.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: 'active' });
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: { $in: ['pending', 'under_review', 'in_progress'] } });
    const urgentComplaints = await Complaint.countDocuments({ priority: 'urgent', status: { $ne: 'resolved' } });
    
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: { $in: ['open', 'in_progress', 'waiting_for_parent'] } });

    const totalEnquiries = await StaffEnquiry.countDocuments();
    const escalatedEnquiries = await StaffEnquiry.countDocuments({ isEscalated: true, status: { $ne: 'resolved' } });

    const resolvedIssues = (await Complaint.countDocuments({ status: 'resolved' })) +
                           (await Ticket.countDocuments({ status: { $in: ['resolved', 'closed'] } })) +
                           (await StaffEnquiry.countDocuments({ status: 'resolved' }));

    // Calculate today's attendance percentage
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayPresent = await Attendance.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'present'
    });

    let todayAttendance = '0%';
    if (totalStudents > 0) {
      todayAttendance = `${Math.round((todayPresent / totalStudents) * 100)}%`;
    }

    res.status(200).json({
      status: true,
      message: 'Dashboard statistics fetched successfully',
      data: {
        totalStudents,
        totalParents,
        totalStaff,
        activeBuses,
        todayAttendance,
        totalComplaints,
        pendingComplaints,
        urgentComplaints,
        totalTickets,
        openTickets,
        totalEnquiries,
        escalatedEnquiries,
        resolvedIssues
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceOverview = async (req, res, next) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const data = await Promise.all(days.map(async (day) => {
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);

      const present = await Attendance.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay }, status: 'present' });
      const absent = await Attendance.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay }, status: 'absent' });
      const late = await Attendance.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay }, status: 'late' });

      return {
        name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        present,
        absent,
        late
      };
    }));

    res.status(200).json({
      status: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('student', 'firstName lastName')
      .populate('bus', 'busNumber');

    const formattedData = attendance.map(a => ({
      id: a._id,
      name: a.student ? `${a.student.firstName} ${a.student.lastName}` : 'Unknown',
      date: new Date(a.date).toLocaleDateString(),
      time: a.time || '-',
      bus: a.bus ? a.bus.busNumber : '-',
      method: a.method === 'face_recognition' ? 'Face Recognition' : 'Manual',
      status: a.status.charAt(0).toUpperCase() + a.status.slice(1)
    }));

    res.status(200).json({
      status: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name');

    const formattedData = complaints.map(c => ({
      id: c.complaintId || c._id,
      parent: c.user ? c.user.name : 'Unknown',
      subject: c.subject,
      date: new Date(c.createdAt).toLocaleDateString(),
      priority: c.priority.charAt(0).toUpperCase() + c.priority.slice(1),
      status: c.status === 'in_progress' ? 'In Progress' : c.status.charAt(0).toUpperCase() + c.status.slice(1)
    }));

    res.status(200).json({
      status: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    // Assuming notifications are global or we fetch admin specific ones.
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedData = notifications.map(n => {
      let icon = 'Info';
      let color = 'text-blue-500';
      let bg = 'bg-blue-100';
      
      if (n.type === 'attendance') {
        icon = 'CheckCircle';
        color = 'text-green-500';
        bg = 'bg-green-100';
      } else if (n.type === 'complaint') {
        icon = 'AlertCircle';
        color = 'text-red-500';
        bg = 'bg-red-100';
      } else if (n.type === 'bus') {
        icon = 'Bus';
        color = 'text-yellow-600';
        bg = 'bg-yellow-100';
      } else if (n.type === 'parent') {
        icon = 'Users';
        color = 'text-blue-500';
        bg = 'bg-blue-100';
      }

      return {
        id: n._id,
        type: n.type,
        message: n.message,
        time: new Date(n.createdAt).toLocaleDateString(),
        iconName: icon,
        color,
        bg,
        isRead: n.isRead
      };
    });

    res.status(200).json({
      status: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

export const getBusOverview = async (req, res, next) => {
  try {
    const buses = await Bus.find()
      .populate('driver', 'firstName lastName')
      .populate('assignedRoute', 'routeName');

    const formattedData = buses.map(b => ({
      id: b.busNumber,
      driver: b.driver ? `${b.driver.firstName} ${b.driver.lastName}` : 'Unassigned',
      route: b.assignedRoute ? b.assignedRoute.routeName : 'Unassigned',
      students: b.capacity, // or you can aggregate actual assigned students
      status: b.status.charAt(0).toUpperCase() + b.status.slice(1)
    }));

    res.status(200).json({
      status: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};
