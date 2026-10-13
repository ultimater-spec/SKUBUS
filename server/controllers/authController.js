import User from '../models/User.js';
import Parent from '../models/Parent.js';
import Staff from '../models/Staff.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      return res.status(400).json({ status: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ status: false, message: 'Passwords do not match' });
    }

    if (role === 'admin') {
      return res.status(403).json({ status: false, message: 'Admin registration is not allowed publicly' });
    }

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
      role
    });

    if (role === 'parent') {
      await Parent.create({
        parentId: `PAR${Date.now()}`,
        user: user._id,
      });
    } else if (role === 'staff') {
      await Staff.create({
        staffId: `STF${Date.now()}`,
        user: user._id,
      });
    }

    // Do not log in automatically or do so, usually we can return success
    res.status(201).json({
      status: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ status: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ status: false, message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: false, message: 'Invalid credentials' });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(res, user._id, user.role);

    res.status(200).json({
      status: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === 'production' || 
      process.env.COOKIE_SECURE === 'true' || 
      Boolean(process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost'));

    res.cookie('token', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      expires: new Date(0)
    });
    res.status(200).json({ status: true, message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    res.status(200).json({
      status: true,
      message: 'User fetched successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;
    
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      status: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ status: false, message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: false, message: 'New passwords do not match' });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      status: true,
      message: 'Password changed successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Admin Endpoints
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ status: true, message: 'Users fetched successfully', data: { users } });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    res.status(200).json({ status: true, message: 'User fetched successfully', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    // Prevent deactivating the only admin
    if (user.role === 'admin' && !isActive) {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ status: false, message: 'Cannot deactivate the last active admin' });
      }
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({ status: true, message: 'User status updated successfully', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ status: false, message: 'Cannot delete the last admin' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    // Also delete associated Parent/Staff record if needed, but not required yet

    res.status(200).json({ status: true, message: 'User deleted successfully', data: {} });
  } catch (error) {
    next(error);
  }
};
