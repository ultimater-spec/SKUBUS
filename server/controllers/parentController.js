import Parent from '../models/Parent.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import bcrypt from 'bcryptjs';

export const getParents = async (req, res, next) => {
  try {
    const parents = await Parent.find()
      .populate('user', 'name email phone isActive')
      .populate({
        path: 'children',
        select: 'name studentId className division status',
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json({ status: true, message: "Parents fetched successfully", data: parents });
  } catch (error) {
    next(error);
  }
};

export const getParentById = async (req, res, next) => {
  try {
    const parent = await Parent.findById(req.params.id)
      .populate('user', 'name email phone isActive')
      .populate({
        path: 'children',
        select: 'name studentId className division status assignedBus assignedRoute',
        populate: [
          { path: 'assignedBus', select: 'busNumber' },
          { path: 'assignedRoute', select: 'routeName' }
        ]
      });
      
    if (!parent) {
      return res.status(404).json({ status: false, message: "Parent not found" });
    }
    res.status(200).json({ status: true, message: "Parent fetched successfully", data: parent });
  } catch (error) {
    next(error);
  }
};

export const createParent = async (req, res, next) => {
  try {
    const { name, email, phone, password, address, emergencyContact, isActive } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ status: false, message: 'User with this email or phone already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create User
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'parent',
      isActive: isActive !== undefined ? isActive : true,
    });
    
    // Create Parent
    const parent = await Parent.create({
      parentId: `PAR${Date.now()}`,
      user: user._id,
      address,
      emergencyContact,
    });
    
    const populatedParent = await Parent.findById(parent._id).populate('user', 'name email phone isActive');
    
    res.status(201).json({ status: true, message: "Parent created successfully", data: populatedParent });
  } catch (error) {
    next(error);
  }
};

export const updateParent = async (req, res, next) => {
  try {
    const { name, email, phone, address, emergencyContact, isActive } = req.body;
    
    const parent = await Parent.findById(req.params.id).populate('user');
    
    if (!parent) {
      return res.status(404).json({ status: false, message: "Parent not found" });
    }
    
    // Check if updating email or phone to an existing one
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
      _id: { $ne: parent.user._id }
    });
    
    if (existingUser) {
      return res.status(400).json({ status: false, message: 'Another user with this email or phone already exists' });
    }
    
    // Update User
    if (name) parent.user.name = name;
    if (email) parent.user.email = email;
    if (phone) parent.user.phone = phone;
    if (isActive !== undefined) parent.user.isActive = isActive;
    await parent.user.save();
    
    // Update Parent
    if (address !== undefined) parent.address = address;
    if (emergencyContact !== undefined) parent.emergencyContact = emergencyContact;
    await parent.save();
    
    const updatedParent = await Parent.findById(req.params.id).populate('user', 'name email phone isActive');
    
    res.status(200).json({ status: true, message: "Parent updated successfully", data: updatedParent });
  } catch (error) {
    next(error);
  }
};

export const deleteParent = async (req, res, next) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({ status: false, message: "Parent not found" });
    }
    
    // Check if parent has children
    const students = await Student.find({ parent: parent._id });
    if (students.length > 0) {
      return res.status(400).json({ 
        status: false, 
        message: "This parent has students assigned. Reassign the students before deleting this parent." 
      });
    }
    
    // Delete User and Parent
    await User.findByIdAndDelete(parent.user);
    await Parent.findByIdAndDelete(parent._id);
    
    res.status(200).json({ status: true, message: "Parent deleted successfully", data: {} });
  } catch (error) {
    next(error);
  }
};
