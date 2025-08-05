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
      kelas
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};
    
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (kelas) filter.kelas = kelas;
    
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
      status = 'aktif'
    } = req.body;

    // Validation
    if (!nama || !password || !role) {
      res.status(400).json({
        success: false,
        error: 'Nama, password, and role are required'
      });
      return;
    }

    // Role-specific validation - kelas required for siswa
    if (role === 'siswa' && !kelas) {
      res.status(400).json({
        success: false,
        error: 'Kelas is required for siswa'
      });
      return;
    }

    // NIS and NIP are optional, will be auto-generated if not provided

    // Check if email already exists (only if email is provided)
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
        return;
      }
    }

    // Auto-generate NIS for siswa if not provided
    let finalNis = nis;
    if (role === 'siswa' && !nis) {
      const lastSiswa = await User.findOne({ role: 'siswa' }).sort({ nis: -1 });
      const lastNisNumber = lastSiswa?.nis ? parseInt(lastSiswa.nis) : 20240000;
      finalNis = (lastNisNumber + 1).toString();
    }

    // Auto-generate NIP for guru if not provided
    let finalNip = nip;
    if (role === 'guru' && !nip) {
      const lastGuru = await User.findOne({ role: 'guru' }).sort({ nip: -1 });
      const lastNipNumber = lastGuru?.nip ? parseInt(lastGuru.nip) : 19800000;
      finalNip = (lastNipNumber + 1).toString();
    }

    // Check if NIS already exists (for siswa)
    if (role === 'siswa' && finalNis) {
      const existingNIS = await User.findOne({ nis: finalNis });
      if (existingNIS) {
        res.status(400).json({
          success: false,
          error: 'NIS already exists'
        });
        return;
      }
    }

    // Check if NIP already exists (for guru)
    if (role === 'guru' && finalNip) {
      const existingNIP = await User.findOne({ nip: finalNip });
      if (existingNIP) {
        res.status(400).json({
          success: false,
          error: 'NIP already exists'
        });
        return;
      }
    }



    // Auto-generate unique username (only letters, numbers, and underscores)
    const cleanNama = nama.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    let username = `${cleanNama}_${role}`;
    
    // Check if username exists and make it unique
    let counter = 1;
    let baseUsername = username;
    while (await User.findOne({ username })) {
      username = `${baseUsername}_${counter}`;
      counter++;
    }

    // Create user
    const userData: Partial<IUser> = {
      nama,
      username,
      password,
      role,
      status
    };

    // Add email only if provided
    if (email) {
      userData.email = email.toLowerCase();
    }

    if (role === 'siswa') {
      userData.nis = finalNis;
      userData.kelas = kelas;
    }

    if (role === 'guru') {
      userData.nip = finalNip;
    }

    const user = new User(userData);
    await user.save();

    // Return user without password
    const newUser = await User.findById(user._id)
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
    }
    
    if (role === 'guru' || user.role === 'guru') {
      if (nip) updateData.nip = nip;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

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
        if (!row.nama || !row.password || !row.role) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing required fields (nama, password, role)`);
          continue;
        }

        // Check if email already exists (only if email is provided)
        if (row.email) {
          const existingUser = await User.findOne({ email: row.email.toLowerCase() });
          if (existingUser) {
            results.failed++;
            results.errors.push(`Row ${i + 2}: Email ${row.email} already exists`);
            continue;
          }
        }

        // Role-specific validation
        if (row.role === 'siswa' && (!row.nis || !row.kelas)) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing required fields for siswa (nis, kelas)`);
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
          password: row.password,
          role: row.role,
          status: row.status || 'aktif'
        };

        // Add email only if provided
        if (row.email) {
          userData.email = row.email.toLowerCase();
        }

        if (row.role === 'siswa') {
          userData.nis = row.nis;
          userData.kelas = row.kelas;
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

// Import users from CSV (bulk import)
export const importUsersFromCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Users array is required and cannot be empty'
      });
      return;
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (let i = 0; i < users.length; i++) {
      try {
        const userData = users[i];
        
        // Validate required fields
        if (!userData.nama || !userData.password || !userData.role) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Missing required fields (nama, password, role)`);
          continue;
        }

        // Check if email already exists (only if email is provided)
        if (userData.email) {
          const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
          if (existingUser) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: Email ${userData.email} already exists`);
            continue;
          }
        }

        // Check if NIS already exists (for siswa)
        if (userData.role === 'siswa' && userData.nis) {
          const existingNIS = await User.findOne({ nis: userData.nis });
          if (existingNIS) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: NIS ${userData.nis} already exists`);
            continue;
          }
        }

        // Check if NIP already exists (for guru)
        if (userData.role === 'guru' && userData.nip) {
          const existingNIP = await User.findOne({ nip: userData.nip });
          if (existingNIP) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: NIP ${userData.nip} already exists`);
            continue;
          }
        }

        // Role-specific validation
        if (userData.role === 'siswa' && (!userData.nis || !userData.kelas)) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Missing required fields for siswa (nis, kelas)`);
          continue;
        }

        if (userData.role === 'guru' && !userData.nip) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Missing NIP for guru`);
          continue;
        }

        // Create user data object
        const newUserData: Partial<IUser> = {
          nama: userData.nama,
          password: userData.password,
          role: userData.role,
          status: userData.status || 'aktif'
        };

        // Add email only if provided
        if (userData.email) {
          newUserData.email = userData.email.toLowerCase();
        }

        if (userData.role === 'siswa') {
          newUserData.nis = userData.nis;
          newUserData.kelas = userData.kelas;
        }

        if (userData.role === 'guru') {
          newUserData.nip = userData.nip;
        }

        // Create user
        const user = new User(newUserData);
        await user.save();
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'CSV import completed',
      data: results
    });
  } catch (error) {
    console.error('Import users from CSV error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Export users to Excel
export const exportUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, status, kelas } = req.query;

    // Build filter
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (kelas) filter.kelas = kelas;

    // Get users
    const users = await User.find(filter)
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
      'Tempat PKL': '',
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