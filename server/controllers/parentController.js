import Parent from '../models/Parent.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';
import bcrypt from 'bcryptjs';

export const getMyParentProfile = async (req, res, next) => {
  try {
    let parent = await Parent.findOne({ user: req.user._id })
      .populate('user', 'name email phone role profileImage isActive')
      .populate({
        path: 'children',
        select: 'name studentId className division status assignedBus assignedRoute profileImage emergencyContact',
        populate: [
          { 
            path: 'assignedBus', 
            select: 'busNumber registrationNumber model driver attendant',
            populate: [
              { path: 'driver', select: 'designation employeeId user', populate: { path: 'user', select: 'name phone email profileImage' } },
              { path: 'attendant', select: 'designation employeeId user', populate: { path: 'user', select: 'name phone email profileImage' } }
            ]
          },
          { path: 'assignedRoute', select: 'routeName routeNumber stops' }
        ]
      });

    // If parent record doesn't exist yet, query students by parent user or emergency contact
    if (!parent) {
      let students = await Student.find({ 
        $or: [
          { emergencyContact: req.user.phone },
          { parent: req.user._id }
        ] 
      });

      parent = await Parent.create({
        parentId: `PAR${Date.now()}`,
        user: req.user._id,
        children: students.map(s => s._id)
      });

      parent = await Parent.findById(parent._id)
        .populate('user', 'name email phone role profileImage isActive')
        .populate({
          path: 'children',
          select: 'name studentId className division status assignedBus assignedRoute profileImage',
          populate: [
            { path: 'assignedBus', select: 'busNumber' },
            { path: 'assignedRoute', select: 'routeName routeNumber' }
          ]
        });
    }

    res.status(200).json({ status: true, message: "Parent profile fetched successfully", data: parent });
  } catch (error) {
    next(error);
  }
};

export const getAssignedStaff = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id }).populate({
      path: 'children',
      populate: [
        { path: 'assignedBus' },
        { path: 'assignedRoute' }
      ]
    });

    if (!parent || !parent.children || parent.children.length === 0) {
      return res.status(200).json({ status: true, message: "No assigned staff found", data: [] });
    }

    const busIds = parent.children.map(c => c.assignedBus?._id).filter(Boolean);
    const routeIds = parent.children.map(c => c.assignedRoute?._id).filter(Boolean);

    // Find all active staff assigned to these buses or routes
    const staffList = await Staff.find({
      $or: [
        { assignedBus: { $in: busIds } },
        { assignedRoute: { $in: routeIds } }
      ],
      status: 'active'
    })
    .populate('user', 'name email phone profileImage')
    .populate('assignedBus', 'busNumber registrationNumber')
    .populate('assignedRoute', 'routeName routeNumber');

    // Also check if buses have driver / attendant fields
    const buses = await Bus.find({ _id: { $in: busIds } })
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name email phone profileImage' }
      })
      .populate({
        path: 'attendant',
        populate: { path: 'user', select: 'name email phone profileImage' }
      });

    const staffMap = new Map();

    staffList.forEach(s => {
      if (s.user) {
        staffMap.set(s._id.toString(), {
          _id: s._id,
          staffId: s.staffId,
          name: s.user.name,
          phone: s.user.phone,
          email: s.user.email,
          profileImage: s.user.profileImage,
          designation: s.designation || 'Transport Staff',
          assignedBus: s.assignedBus?.busNumber || 'Assigned Bus',
          assignedRoute: s.assignedRoute?.routeName || 'Assigned Route',
          students: parent.children
            .filter(c => c.assignedBus?._id?.toString() === s.assignedBus?._id?.toString() || c.assignedRoute?._id?.toString() === s.assignedRoute?._id?.toString())
            .map(c => ({ id: c._id, name: c.name, studentId: c.studentId }))
        });
      }
    });

    buses.forEach(b => {
      [b.driver, b.attendant].forEach(s => {
        if (s && s.user && !staffMap.has(s._id.toString())) {
          staffMap.set(s._id.toString(), {
            _id: s._id,
            staffId: s.staffId,
            name: s.user.name,
            phone: s.user.phone,
            email: s.user.email,
            profileImage: s.user.profileImage,
            designation: s.designation || (s._id?.toString() === b.driver?._id?.toString() ? 'Bus Driver' : 'Bus Attendant'),
            assignedBus: b.busNumber,
            assignedRoute: b.assignedRoute?.routeName || 'Route',
            students: parent.children
              .filter(c => c.assignedBus?._id?.toString() === b._id.toString())
              .map(c => ({ id: c._id, name: c.name, studentId: c.studentId }))
          });
        }
      });
    });

    const result = Array.from(staffMap.values());
    res.status(200).json({ status: true, message: "Assigned staff fetched successfully", data: result });
  } catch (error) {
    next(error);
  }
};

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
