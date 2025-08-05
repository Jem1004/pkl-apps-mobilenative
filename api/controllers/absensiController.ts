import { Request, Response } from 'express';
import { Absensi, IAbsensi, User, Settings } from '../models/index.ts';
import mongoose from 'mongoose';

// Helper function to get attendance time settings
const getAttendanceSettings = async () => {
  const jamMasukSetting = await Settings.findOne({ key: 'jam_masuk' });
  const jamPulangSetting = await Settings.findOne({ key: 'jam_pulang' });
  const toleransiSetting = await Settings.findOne({ key: 'toleransi_terlambat' });

  return {
    jamMasuk: jamMasukSetting?.value || 480, // 08:00 default
    jamPulang: jamPulangSetting?.value || 960, // 16:00 default
    toleransi: toleransiSetting?.value || 15 // 15 minutes default
  };
};

// Helper function to determine attendance status
const determineAttendanceStatus = (jamMasuk: Date, settings: any): string => {
  const masukTime = jamMasuk.getHours() * 60 + jamMasuk.getMinutes();
  const batasWaktu = settings.jamMasuk + settings.toleransi;
  
  if (masukTime <= settings.jamMasuk) {
    return 'hadir';
  } else if (masukTime <= batasWaktu) {
    return 'hadir'; // Still considered present within tolerance
  } else {
    return 'terlambat';
  }
};

// Check in (absen masuk)
export const checkIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { keterangan_masuk } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Only siswa can check in
    if (req.user?.role !== 'siswa') {
      res.status(403).json({
        success: false,
        error: 'Only students can check in'
      });
      return;
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Check if already checked in today
    const existingAbsensi = await Absensi.findOne({
      user_id: userId,
      tanggal: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (existingAbsensi && existingAbsensi.jam_masuk) {
      res.status(400).json({
        success: false,
        error: 'Already checked in today',
        data: {
          jam_masuk: existingAbsensi.jam_masuk,
          status: existingAbsensi.status
        }
      });
      return;
    }

    const jamMasuk = new Date();
    const settings = await getAttendanceSettings();
    const status = determineAttendanceStatus(jamMasuk, settings);

    let absensi;
    if (existingAbsensi) {
      // Update existing record
      absensi = await Absensi.findByIdAndUpdate(
        existingAbsensi._id,
        {
          jam_masuk: jamMasuk,
          keterangan_masuk,
          status
        },
        { new: true }
      ).populate('user_id', 'nama nis kelas');
    } else {
      // Create new record
      absensi = new Absensi({
        user_id: userId,
        tanggal: startOfDay,
        jam_masuk: jamMasuk,
        keterangan_masuk,
        status
      });
      await absensi.save();
      await absensi.populate('user_id', 'nama nis kelas');
    }

    res.status(200).json({
      success: true,
      message: 'Check in successful',
      data: { absensi }
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Check out (absen pulang)
export const checkOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { keterangan_pulang } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Only siswa can check out
    if (req.user?.role !== 'siswa') {
      res.status(403).json({
        success: false,
        error: 'Only students can check out'
      });
      return;
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Find today's attendance record
    const absensi = await Absensi.findOne({
      user_id: userId,
      tanggal: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!absensi) {
      res.status(400).json({
        success: false,
        error: 'No check-in record found for today. Please check in first.'
      });
      return;
    }

    if (!absensi.jam_masuk) {
      res.status(400).json({
        success: false,
        error: 'No check-in time found. Please check in first.'
      });
      return;
    }

    if (absensi.jam_pulang) {
      res.status(400).json({
        success: false,
        error: 'Already checked out today',
        data: {
          jam_pulang: absensi.jam_pulang
        }
      });
      return;
    }

    const jamPulang = new Date();

    // Update attendance record
    const updatedAbsensi = await Absensi.findByIdAndUpdate(
      absensi._id,
      {
        jam_pulang: jamPulang,
        keterangan_pulang
      },
      { new: true }
    ).populate('user_id', 'nama nis kelas');

    res.status(200).json({
      success: true,
      message: 'Check out successful',
      data: { absensi: updatedAbsensi }
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get today's attendance status
export const getTodayAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const absensi = await Absensi.findOne({
      user_id: userId,
      tanggal: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('user_id', 'nama nis kelas');

    const settings = await getAttendanceSettings();

    res.status(200).json({
      success: true,
      data: {
        absensi,
        settings: {
          jam_masuk_standar: `${Math.floor(settings.jamMasuk / 60).toString().padStart(2, '0')}:${(settings.jamMasuk % 60).toString().padStart(2, '0')}`,
          jam_pulang_standar: `${Math.floor(settings.jamPulang / 60).toString().padStart(2, '0')}:${(settings.jamPulang % 60).toString().padStart(2, '0')}`,
          toleransi_terlambat: settings.toleransi
        }
      }
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get attendance history
export const getAttendanceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      user_id,
      start_date,
      end_date,
      status,
      tempat_pkl
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    
    // If not admin/guru, only show own attendance
    if (req.user?.role === 'siswa') {
      filter.user_id = req.user._id;
    } else if (user_id) {
      filter.user_id = user_id;
    }

    if (start_date && end_date) {
      filter.tanggal = {
        $gte: new Date(start_date as string),
        $lte: new Date(end_date as string)
      };
    } else if (start_date) {
      filter.tanggal = { $gte: new Date(start_date as string) };
    } else if (end_date) {
      filter.tanggal = { $lte: new Date(end_date as string) };
    }

    if (status) {
      filter.status = status;
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'tempatpkls',
          localField: 'user.tempat_pkl',
          foreignField: '_id',
          as: 'tempat_pkl'
        }
      },
      {
        $addFields: {
          tempat_pkl: { $arrayElemAt: ['$tempat_pkl', 0] }
        }
      }
    ];

    // Add tempat_pkl filter if specified
    if (tempat_pkl) {
      pipeline.push({
        $match: {
          'user.tempat_pkl': new mongoose.Types.ObjectId(tempat_pkl as string)
        }
      });
    }

    // Add sorting
    pipeline.push({ $sort: { tanggal: -1, 'user.nama': 1 } });

    // Get total count
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Absensi.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    // Execute aggregation
    const absensi = await Absensi.aggregate(pipeline);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        absensi,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: total,
          items_per_page: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get attendance statistics
export const getAttendanceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      user_id,
      start_date,
      end_date,
      tempat_pkl
    } = req.query;

    // Build filter
    const filter: any = {};
    
    // If not admin/guru, only show own stats
    if (req.user?.role === 'siswa') {
      filter.user_id = req.user._id;
    } else if (user_id) {
      filter.user_id = new mongoose.Types.ObjectId(user_id as string);
    }

    if (start_date && end_date) {
      filter.tanggal = {
        $gte: new Date(start_date as string),
        $lte: new Date(end_date as string)
      };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: filter }
    ];

    // Add tempat_pkl filter if specified
    if (tempat_pkl) {
      pipeline.unshift(
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $match: {
            'user.tempat_pkl': new mongoose.Types.ObjectId(tempat_pkl as string)
          }
        }
      );
    }

    // Group by status
    pipeline.push(
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          percentage: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' },
          stats: {
            $push: {
              status: '$_id',
              count: '$count'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          stats: {
            $map: {
              input: '$stats',
              as: 'stat',
              in: {
                status: '$$stat.status',
                count: '$$stat.count',
                percentage: {
                  $round: [
                    { $multiply: [{ $divide: ['$$stat.count', '$total'] }, 100] },
                    2
                  ]
                }
              }
            }
          }
        }
      }
    );

    const result = await Absensi.aggregate(pipeline);
    const stats = result[0] || { total: 0, stats: [] };

    // Ensure all status types are represented
    const allStatuses = ['hadir', 'terlambat', 'tidak_hadir', 'izin', 'sakit'];
    const completeStats = allStatuses.map(status => {
      const existing = stats.stats.find((s: any) => s.status === status);
      return existing || { status, count: 0, percentage: 0 };
    });

    res.status(200).json({
      success: true,
      data: {
        total: stats.total,
        stats: completeStats
      }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Manual attendance entry (for admin/guru)
export const createManualAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      user_id,
      tanggal,
      jam_masuk,
      jam_pulang,
      keterangan_masuk,
      keterangan_pulang,
      status
    } = req.body;

    // Validation
    if (!user_id || !tanggal || !status) {
      res.status(400).json({
        success: false,
        error: 'User ID, tanggal, and status are required'
      });
      return;
    }

    // Check if user exists and is a student
    const user = await User.findById(user_id);
    if (!user || user.role !== 'siswa') {
      res.status(400).json({
        success: false,
        error: 'User not found or not a student'
      });
      return;
    }

    const attendanceDate = new Date(tanggal);
    const startOfDay = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate());
    const endOfDay = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate(), 23, 59, 59);

    // Check if attendance already exists for this date
    const existingAbsensi = await Absensi.findOne({
      user_id,
      tanggal: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (existingAbsensi) {
      res.status(400).json({
        success: false,
        error: 'Attendance record already exists for this date'
      });
      return;
    }

    // Create attendance record
    const absensiData: Partial<IAbsensi> = {
      user_id,
      tanggal: startOfDay,
      status,
      keterangan_masuk,
      keterangan_pulang
    };

    if (jam_masuk) {
      absensiData.jam_masuk = new Date(jam_masuk);
    }

    if (jam_pulang) {
      absensiData.jam_pulang = new Date(jam_pulang);
    }

    const absensi = new Absensi(absensiData);
    await absensi.save();
    await absensi.populate('user_id', 'nama nis kelas');

    res.status(201).json({
      success: true,
      message: 'Manual attendance created successfully',
      data: { absensi }
    });
  } catch (error) {
    console.error('Create manual attendance error:', error);
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