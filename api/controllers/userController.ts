import { Request, Response } from 'express';
import { User, IUser, TempatPKL } from '../models/index.ts';
import XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

// Get all users with pagination and filtering
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      kelas,
      tempat_pkl
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};
    
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (kelas) filter.kelas = kelas;
    if (tempat_pkl) filter.tempat_pkl = tempat_pkl;
    
    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nis: { $regex: search, $options: 'i' } },
        { nip: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(filter)
      .populate('tempat_pkl', 'nama alamat')
      .select('-password')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: total,
          items_per_page: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('tempat_pkl', 'nama alamat kontak')
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
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nama,
      email,
      password,
      role,
      nis,
      nip,
      kelas,
      tempat_pkl,
      status = 'aktif'
    } = req.body;

    // Validation
    if (!nama || !email || !password || !role) {
      res.status(400).json({
        success: false,
        error: 'Nama, email, password, and role are required'
      });
      return;
    }

    // Role-specific validation
    if (role === 'siswa' && (!nis || !kelas || !tempat_pkl)) {
      res.status(400).json({
        success: false,
        error: 'NIS, kelas, and tempat_pkl are required for siswa'
      });
      return;
    }

    if (role === 'guru' && !nip) {
      res.status(400).json({
        success: false,
        error: 'NIP is required for guru'
      });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
      return;
    }

    // Check if NIS already exists (for siswa)
    if (role === 'siswa' && nis) {
      const existingNIS = await User.findOne({ nis });
      if (existingNIS) {
        res.status(400).json({
          success: false,
          error: 'NIS already exists'
        });
        return;
      }
    }

    // Check if NIP already exists (for guru)
    if (role === 'guru' && nip) {
      const existingNIP = await User.findOne({ nip });
      if (existingNIP) {
        res.status(400).json({
          success: false,
          error: 'NIP already exists'
        });
        return;
      }
    }

    // Validate tempat_pkl exists (for siswa)
    if (role === 'siswa' && tempat_pkl) {
      const tempatPKLExists = await TempatPKL.findById(tempat_pkl);
      if (!tempatPKLExists) {
        res.status(400).json({
          success: false,
          error: 'Tempat PKL not found'
        });
        return;
      }
    }

    // Create user
    const userData: Partial<IUser> = {
      nama,
      email: email.toLowerCase(),
      password,
      role,
      status
    };

    if (role === 'siswa') {
      userData.nis = nis;
      userData.kelas = kelas;
      userData.tempat_pkl = tempat_pkl;
    }

    if (role === 'guru') {
      userData.nip = nip;
    }

    const user = new User(userData);
    await user.save();

    // Populate and return user without password
    const newUser = await User.findById(user._id)
      .populate('tempat_pkl', 'nama alamat')
      .select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: newUser }
    });
  } catch (error) {
    console.error('Create user error:', error);
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

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      nama,
      email,
      role,
      nis,
      nip,
      kelas,
      tempat_pkl,
      status
    } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Check if email already exists (if changing email)
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
        return;
      }
    }

    // Build update object
    const updateData: Partial<IUser> = {};
    
    if (nama) updateData.nama = nama;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    // Role-specific updates
    if (role === 'siswa' || user.role === 'siswa') {
      if (nis) updateData.nis = nis;
      if (kelas) updateData.kelas = kelas;
      if (tempat_pkl) updateData.tempat_pkl = tempat_pkl;
    }
    
    if (role === 'guru' || user.role === 'guru') {
      if (nip) updateData.nip = nip;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('tempat_pkl', 'nama alamat').select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
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

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Prevent deleting admin if it's the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete the last admin user'
        });
        return;
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Reset user password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Import users from Excel
export const importUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Excel file is required'
      });
      return;
    }

    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i] as any;
        
        // Validate required fields
        if (!row.nama || !row.email || !row.password || !row.role) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing required fields (nama, email, password, role)`);
          continue;
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: row.email.toLowerCase() });
        if (existingUser) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Email ${row.email} already exists`);
          continue;
        }

        // Role-specific validation
        if (row.role === 'siswa' && (!row.nis || !row.kelas || !row.tempat_pkl)) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing required fields for siswa (nis, kelas, tempat_pkl)`);
          continue;
        }

        if (row.role === 'guru' && !row.nip) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing NIP for guru`);
          continue;
        }

        // Create user data
        const userData: Partial<IUser> = {
          nama: row.nama,
          email: row.email.toLowerCase(),
          password: row.password,
          role: row.role,
          status: row.status || 'aktif'
        };

        if (row.role === 'siswa') {
          userData.nis = row.nis;
          userData.kelas = row.kelas;
          userData.tempat_pkl = row.tempat_pkl;
        }

        if (row.role === 'guru') {
          userData.nip = row.nip;
        }

        // Create user
        const user = new User(userData);
        await user.save();
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Import completed',
      data: results
    });
  } catch (error) {
    console.error('Import users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Export users to Excel
export const exportUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, status, kelas, tempat_pkl } = req.query;

    // Build filter
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (kelas) filter.kelas = kelas;
    if (tempat_pkl) filter.tempat_pkl = tempat_pkl;

    // Get users
    const users = await User.find(filter)
      .populate('tempat_pkl', 'nama')
      .select('-password')
      .sort({ created_at: -1 });

    // Prepare data for Excel
    const excelData = users.map(user => ({
      Nama: user.nama,
      Email: user.email,
      Role: user.role,
      NIS: user.nis || '',
      NIP: user.nip || '',
      Kelas: user.kelas || '',
      'Tempat PKL': user.tempat_pkl ? (user.tempat_pkl as any).nama : '',
      Status: user.status,
      'Tanggal Dibuat': user.created_at.toLocaleDateString('id-ID')
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=users_${new Date().toISOString().split('T')[0]}.xlsx`);

    res.send(buffer);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};