import Staff from '../models/Staff.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.find()
      .populate('user', 'name email phone isActive')
      .populate('assignedBus', 'busNumber registrationNumber')
      .populate('assignedRoute', 'routeName routeNumber')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ status: true, message: "Staff fetched successfully", data: staff });
  } catch (error) {
    next(error);
  }
};

export const getStaffById = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('user', 'name email phone isActive')
      .populate('assignedBus', 'busNumber registrationNumber')
      .populate('assignedRoute', 'routeName routeNumber');
      
    if (!staff) {
      return res.status(404).json({ status: false, message: "Staff not found" });
    }
    res.status(200).json({ status: true, message: "Staff fetched successfully", data: staff });
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const { name, email, phone, password, employeeId, designation, assignedBus, assignedRoute, joiningDate, emergencyContact, address, status, isActive } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ status: false, message: 'User with this email or phone already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'staff',
      isActive: isActive !== undefined ? isActive : true,
    });
    
    const staffData = {
      staffId: `STF${Date.now()}`,
      user: user._id,
      employeeId,
      designation,
      joiningDate,
      emergencyContact,
      address,
      status: status || 'active'
    };
    
    if (assignedBus) staffData.assignedBus = assignedBus;
    if (assignedRoute) staffData.assignedRoute = assignedRoute;

    const staff = await Staff.create(staffData);
    
    const populatedStaff = await Staff.findById(staff._id).populate('user', 'name email phone isActive');
    
    res.status(201).json({ status: true, message: "Staff created successfully", data: populatedStaff });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const { name, email, phone, employeeId, designation, assignedBus, assignedRoute, joiningDate, emergencyContact, address, status, isActive } = req.body;
    
    const staff = await Staff.findById(req.params.id).populate('user');
    
    if (!staff) {
      return res.status(404).json({ status: false, message: "Staff not found" });
    }
    
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
      _id: { $ne: staff.user._id }
    });
    
    if (existingUser) {
      return res.status(400).json({ status: false, message: 'Another user with this email or phone already exists' });
    }
    
    if (name) staff.user.name = name;
    if (email) staff.user.email = email;
    if (phone) staff.user.phone = phone;
    if (isActive !== undefined) staff.user.isActive = isActive;
    await staff.user.save();
    
    if (employeeId !== undefined) staff.employeeId = employeeId;
    if (designation !== undefined) staff.designation = designation;
    if (assignedBus !== undefined) staff.assignedBus = assignedBus === "" ? null : assignedBus;
    if (assignedRoute !== undefined) staff.assignedRoute = assignedRoute === "" ? null : assignedRoute;
    if (joiningDate !== undefined) staff.joiningDate = joiningDate;
    if (emergencyContact !== undefined) staff.emergencyContact = emergencyContact;
    if (address !== undefined) staff.address = address;
    if (status !== undefined) staff.status = status;
    await staff.save();
    
    const updatedStaff = await Staff.findById(req.params.id)
      .populate('user', 'name email phone isActive')
      .populate('assignedBus', 'busNumber')
      .populate('assignedRoute', 'routeName');
    
    res.status(200).json({ status: true, message: "Staff updated successfully", data: updatedStaff });
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ status: false, message: "Staff not found" });
    }
    
    await User.findByIdAndDelete(staff.user);
    await Staff.findByIdAndDelete(staff._id);
    
    res.status(200).json({ status: true, message: "Staff deleted successfully", data: {} });
  } catch (error) {
    next(error);
  }
};
