import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

export const getAttendance = async (req, res, next) => {
  try {
    const { date, studentId, busId, routeId, status, method } = req.query;
    
    let query = {};
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    if (studentId) query.student = studentId;
    if (busId) query.bus = busId;
    if (routeId) query.route = routeId;
    if (status) query.status = status;
    if (method) query.method = method;

    const attendance = await Attendance.find(query)
      .populate({
        path: 'student',
        select: 'name studentId className division',
        populate: { path: 'user', select: 'name profileImage' }
      })
      .populate('bus', 'busNumber registrationNumber')
      .populate('route', 'routeName routeNumber')
      .sort({ date: -1, createdAt: -1 });
      
    res.status(200).json({ status: true, message: "Attendance fetched successfully", data: attendance });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate({
        path: 'student',
        select: 'name studentId className division',
        populate: { path: 'user', select: 'name profileImage' }
      })
      .populate('bus', 'busNumber')
      .populate('route', 'routeName');
      
    if (!attendance) {
      return res.status(404).json({ status: false, message: "Attendance record not found" });
    }
    res.status(200).json({ status: true, message: "Attendance fetched successfully", data: attendance });
  } catch (error) {
    next(error);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { student, date, time, type, method, bus, route, status, remarks } = req.body;
    
    const attendance = await Attendance.create({
      student,
      date: date || new Date(),
      time: time || new Date().toLocaleTimeString(),
      type,
      method,
      bus,
      route,
      status,
      remarks
    });
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'name studentId');
      
    res.status(201).json({ status: true, message: "Attendance marked successfully", data: populatedAttendance });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ status: false, message: "Attendance not found" });
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ status: true, message: "Attendance updated successfully", data: updatedAttendance });
  } catch (error) {
    next(error);
  }
};

export const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ status: false, message: "Attendance not found" });
    }
    
    await Attendance.findByIdAndDelete(attendance._id);
    
    res.status(200).json({ status: true, message: "Attendance deleted successfully", data: {} });
  } catch (error) {
    next(error);
  }
};
