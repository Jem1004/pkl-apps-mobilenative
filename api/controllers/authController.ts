import { Request, Response } from 'express';
import { User, IUser, Settings } from '../models/index.ts';
import { generateToken } from '../middleware/auth.ts';
import bcrypt from 'bcryptjs';

// Login controller
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, passwordLength: password?.length });

    // Validation
    if (!username || !password) {
      console.log('Login failed: Missing username or password');
      res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
      return;
    }

    // Find user by username
    const user = await User.findOne({ username: username.toLowerCase() })
      .select('+password');

    console.log('User found:', user ? { id: user._id, username: user.username, status: user.status } : 'No user found');

    if (!user) {
      console.log('Login failed: User not found for username:', username);
      res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
      return;
    }

    // Check if user is active
    if (user.status !== 'aktif') {
      console.log('Login failed: User status is not aktif:', user.status);
      res.status(401).json({
        success: false,
        error: 'Account is inactive. Please contact administrator.'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
      return;
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id)
      .select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, email, kelas } = req.body;
    const userId = req.user?._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Update allowed fields based on role
    const updateData: Partial<IUser> = {};
    
    if (nama) updateData.nama = nama;
    
    // Only allow email update for admin
    if (email && req.user?.role === 'admin') {
      updateData.email = email.toLowerCase();
    }
    
    // Only allow kelas update for siswa
    if (kelas && user.role === 'siswa') {
      updateData.kelas = kelas;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;

    // Validation
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
      return;
    }

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Initialize default admin account
export const initializeAdmin = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const defaultAdmin = new User({
        nama: process.env.DEFAULT_ADMIN_NAME || 'Administrator',
        username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@abasensi.com',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        status: 'aktif'
      });

      await defaultAdmin.save();
      console.log('Default admin account created successfully');
      
      // Initialize default settings
      await initializeDefaultSettings();
    } else {
      // Check if existing admin has username, if not add it
      if (!adminExists.username) {
        adminExists.username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
        await adminExists.save();
        console.log('Admin username added successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

// Initialize default settings
const initializeDefaultSettings = async (): Promise<void> => {
  try {
    const defaultSettings = [
      {
        key: 'jam_masuk',
        value: parseInt(process.env.DEFAULT_JAM_MASUK || '480'), // 08:00
        description: 'Jam masuk standar (dalam menit dari tengah malam)'
      },
      {
        key: 'jam_pulang',
        value: parseInt(process.env.DEFAULT_JAM_PULANG || '960'), // 16:00
        description: 'Jam pulang standar (dalam menit dari tengah malam)'
      },
      {
        key: 'toleransi_terlambat',
        value: parseInt(process.env.DEFAULT_TOLERANSI_TERLAMBAT || '15'), // 15 minutes
        description: 'Toleransi keterlambatan (dalam menit)'
      }
    ];

    for (const setting of defaultSettings) {
      const existingSetting = await Settings.findOne({ key: setting.key });
      if (!existingSetting) {
        await Settings.create(setting);
      }
    }

    console.log('Default settings initialized successfully');
  } catch (error) {
    console.error('Error initializing default settings:', error);
  }
};