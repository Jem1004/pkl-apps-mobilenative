import { Request, Response } from 'express';
import { TempatPKL, ITempatPKL, User } from '../models/index.ts';

// Get all tempat PKL with pagination and filtering
export const getTempatPKL = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};
    
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: 'i' } },
        { alamat: { $regex: search, $options: 'i' } },
        { kontak: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get tempat PKL with pagination
    const tempatPKL = await TempatPKL.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await TempatPKL.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        tempat_pkl: tempatPKL,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: total,
          items_per_page: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get tempat PKL error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get all tempat PKL (for dropdown/select options)
export const getAllTempatPKL = async (req: Request, res: Response): Promise<void> => {
  try {
    const tempatPKL = await TempatPKL.find({ status: 'aktif' })
      .select('nama alamat')
      .sort({ nama: 1 });

    res.status(200).json({
      success: true,
      data: { tempat_pkl: tempatPKL }
    });
  } catch (error) {
    console.error('Get all tempat PKL error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get tempat PKL by ID
export const getTempatPKLById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tempatPKL = await TempatPKL.findById(id);

    if (!tempatPKL) {
      res.status(404).json({
        success: false,
        error: 'Tempat PKL not found'
      });
      return;
    }

    // Get students count for this tempat PKL
    const studentsCount = await User.countDocuments({
      tempat_pkl: id,
      role: 'siswa',
      status: 'aktif'
    });

    res.status(200).json({
      success: true,
      data: {
        tempat_pkl: tempatPKL,
        students_count: studentsCount
      }
    });
  } catch (error) {
    console.error('Get tempat PKL by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Create new tempat PKL
export const createTempatPKL = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nama,
      alamat,
      kontak,
      email,
      status = 'aktif'
    } = req.body;

    // Validation
    if (!nama) {
      res.status(400).json({
        success: false,
        error: 'Nama is required'
      });
      return;
    }

    // Check if nama already exists
    const existingTempatPKL = await TempatPKL.findOne({ 
      nama: { $regex: new RegExp(`^${nama}$`, 'i') }
    });
    
    if (existingTempatPKL) {
      res.status(400).json({
        success: false,
        error: 'Tempat PKL with this name already exists'
      });
      return;
    }

    // Create tempat PKL
    const tempatPKL = new TempatPKL({
      nama,
      alamat,
      kontak,
      email,
      status
    });

    await tempatPKL.save();

    res.status(201).json({
      success: true,
      message: 'Tempat PKL created successfully',
      data: { tempat_pkl: tempatPKL }
    });
  } catch (error) {
    console.error('Create tempat PKL error:', error);
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

// Update tempat PKL
export const updateTempatPKL = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      nama,
      alamat,
      kontak,
      email,
      status
    } = req.body;

    // Find tempat PKL
    const tempatPKL = await TempatPKL.findById(id);
    if (!tempatPKL) {
      res.status(404).json({
        success: false,
        error: 'Tempat PKL not found'
      });
      return;
    }

    // Check if nama already exists (if changing nama)
    if (nama && nama.toLowerCase() !== tempatPKL.nama.toLowerCase()) {
      const existingTempatPKL = await TempatPKL.findOne({ 
        nama: { $regex: new RegExp(`^${nama}$`, 'i') }
      });
      
      if (existingTempatPKL) {
        res.status(400).json({
          success: false,
          error: 'Tempat PKL with this name already exists'
        });
        return;
      }
    }

    // Build update object
    const updateData: Partial<ITempatPKL> = {};
    
    if (nama) updateData.nama = nama;
    if (alamat) updateData.alamat = alamat;
    if (kontak) updateData.kontak = kontak;
    if (email !== undefined) updateData.email = email;
    if (status) updateData.status = status;

    const updatedTempatPKL = await TempatPKL.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Tempat PKL updated successfully',
      data: { tempat_pkl: updatedTempatPKL }
    });
  } catch (error) {
    console.error('Update tempat PKL error:', error);
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

// Delete tempat PKL
export const deleteTempatPKL = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tempatPKL = await TempatPKL.findById(id);
    if (!tempatPKL) {
      res.status(404).json({
        success: false,
        error: 'Tempat PKL not found'
      });
      return;
    }

    // Check if there are students assigned to this tempat PKL
    const studentsCount = await User.countDocuments({
      tempat_pkl: id,
      role: 'siswa'
    });

    if (studentsCount > 0) {
      res.status(400).json({
        success: false,
        error: `Cannot delete tempat PKL. There are ${studentsCount} students assigned to this location.`
      });
      return;
    }

    await TempatPKL.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Tempat PKL deleted successfully'
    });
  } catch (error) {
    console.error('Delete tempat PKL error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Bulk import tempat PKL
export const bulkImportTempatPKL = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Data array is required and cannot be empty'
      });
      return;
    }

    const results = {
      success: [],
      errors: [],
      total: data.length
    };

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const rowNumber = i + 1;

      try {
        // Validation
        if (!item.nama || typeof item.nama !== 'string' || item.nama.trim() === '') {
          results.errors.push({
            row: rowNumber,
            data: item,
            error: 'Nama is required and must be a non-empty string'
          });
          continue;
        }

        // Check if nama already exists
        const existingTempatPKL = await TempatPKL.findOne({ 
          nama: { $regex: new RegExp(`^${item.nama.trim()}$`, 'i') }
        });
        
        if (existingTempatPKL) {
          results.errors.push({
            row: rowNumber,
            data: item,
            error: `Tempat PKL with name '${item.nama}' already exists`
          });
          continue;
        }

        // Create tempat PKL
        const tempatPKLData = {
          nama: item.nama.trim(),
          alamat: item.alamat ? item.alamat.trim() : '',
          kontak: item.kontak ? item.kontak.trim() : '',
          email: item.email ? item.email.trim() : '',
          status: item.status && ['aktif', 'tidak_aktif'].includes(item.status) ? item.status : 'aktif'
        };

        const tempatPKL = new TempatPKL(tempatPKLData);
        await tempatPKL.save();

        results.success.push({
          row: rowNumber,
          data: tempatPKL
        });
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          data: item,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }

    const statusCode = results.errors.length === 0 ? 201 : 207; // 207 Multi-Status

    res.status(statusCode).json({
      success: results.errors.length === 0,
      message: `Import completed. ${results.success.length} items imported successfully, ${results.errors.length} items failed.`,
      data: results
    });
  } catch (error) {
    console.error('Bulk import tempat PKL error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get students by tempat PKL
export const getStudentsByTempatPKL = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Check if tempat PKL exists
    const tempatPKL = await TempatPKL.findById(id);
    if (!tempatPKL) {
      res.status(404).json({
        success: false,
        error: 'Tempat PKL not found'
      });
      return;
    }

    // Build filter
    const filter: any = {
      tempat_pkl: id,
      role: 'siswa'
    };
    
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nis: { $regex: search, $options: 'i' } },
        { kelas: { $regex: search, $options: 'i' } }
      ];
    }

    // Get students
    const students = await User.find(filter)
      .select('-password')
      .sort({ nama: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        tempat_pkl: tempatPKL,
        students,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: total,
          items_per_page: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get students by tempat PKL error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};