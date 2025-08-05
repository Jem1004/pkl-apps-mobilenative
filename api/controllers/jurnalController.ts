/**
 * Journal (Jurnal) Controller
 * Handle journal entries, comments, and review operations
 */
import { Request, Response } from 'express';
import Jurnal from '../models/Jurnal.ts';
import Comment from '../models/Comment.ts';
import { User } from '../models/User.ts';
import { AuthRequest } from '../middleware/auth.ts';
import mongoose from 'mongoose';

/**
 * Get all journals with pagination and filtering
 * @route GET /api/jurnal
 * @access All authenticated users (siswa see own data, admin/guru see all)
 */
export const getJurnals = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      user_id,
      start_date,
      end_date,
      status,
      tempat_pkl,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter based on user role
    let filter: any = {};

    // Role-based access control
    if (req.user?.role === 'siswa') {
      filter.user_id = req.user.id;
    } else if (user_id) {
      filter.user_id = user_id;
    }

    // Date range filter
    if (start_date || end_date) {
      filter.tanggal = {};
      if (start_date) filter.tanggal.$gte = new Date(start_date as string);
      if (end_date) filter.tanggal.$lte = new Date(end_date as string);
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { kegiatan: { $regex: search, $options: 'i' } }
      ];
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
      { $unwind: '$user' }
    ];

    // Filter by tempat PKL if specified
    if (tempat_pkl) {
      pipeline.push({
        $match: {
          'user.tempat_pkl': new mongoose.Types.ObjectId(tempat_pkl as string)
        }
      });
    }

    // Add comment count
    pipeline.push(
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'jurnal_id',
          as: 'comments'
        }
      },
      {
        $addFields: {
          comment_count: { $size: '$comments' }
        }
      },
      {
        $project: {
          comments: 0,
          'user.password': 0
        }
      },
      { $sort: { tanggal: -1, createdAt: -1 } }
    );

    // Get total count
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Jurnal.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Add pagination
    pipeline.push(
      { $skip: skip },
      { $limit: limitNum }
    );

    const journals = await Jurnal.aggregate(pipeline);

    res.json({
      success: true,
      data: journals,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_items: total,
        items_per_page: limitNum
      }
    });
  } catch (error) {
    console.error('Get journals error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jurnal'
    });
  }
};

/**
 * Get journal by ID with comments
 * @route GET /api/jurnal/:id
 * @access All authenticated users (siswa see own data, admin/guru see all)
 */
export const getJurnalById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID jurnal tidak valid'
      });
    }

    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
          from: 'comments',
          localField: '_id',
          foreignField: 'jurnal_id',
          as: 'comments',
          pipeline: [
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
              $project: {
                'user.password': 0
              }
            },
            { $sort: { createdAt: 1 } }
          ]
        }
      },
      {
        $project: {
          'user.password': 0
        }
      }
    ];

    const result = await Jurnal.aggregate(pipeline as any);
    const journal = result[0];

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Jurnal tidak ditemukan'
      });
    }

    // Check access permission
    if (req.user?.role === 'siswa' && journal.user_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki akses ke jurnal ini'
      });
    }

    res.json({
      success: true,
      data: journal
    });
  } catch (error) {
    console.error('Get journal by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jurnal'
    });
  }
};

/**
 * Create new journal entry
 * @route POST /api/jurnal
 * @access Siswa only
 */
export const createJurnal = async (req: AuthRequest, res: Response) => {
  try {
    const { tanggal, kegiatan, dokumentasi } = req.body;

    // Validation
    if (!tanggal || !kegiatan) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal dan kegiatan wajib diisi'
      });
    }

    // Check if user is siswa
    if (req.user?.role !== 'siswa') {
      return res.status(403).json({
        success: false,
        message: 'Hanya siswa yang dapat membuat jurnal'
      });
    }

    // Check if journal already exists for this date
    const existingJournal = await Jurnal.findOne({
      user_id: req.user.id,
      tanggal: new Date(tanggal)
    });

    if (existingJournal) {
      return res.status(400).json({
        success: false,
        message: 'Jurnal untuk tanggal ini sudah ada'
      });
    }

    const journal = new Jurnal({
      user_id: req.user.id,
      tanggal: new Date(tanggal),
      kegiatan,
      link_dokumentasi: dokumentasi || null,
      status: 'pending'
    });

    await journal.save();

    // Populate user data
    await journal.populate('user_id', 'nama email nis kelas');

    res.status(201).json({
      success: true,
      message: 'Jurnal berhasil dibuat',
      data: journal
    });
  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat jurnal'
    });
  }
};

/**
 * Update journal entry
 * @route PUT /api/jurnal/:id
 * @access Siswa (own data), Admin, Guru
 */
export const updateJurnal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tanggal, kegiatan, dokumentasi, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID jurnal tidak valid'
      });
    }

    const journal = await Jurnal.findById(id);
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Jurnal tidak ditemukan'
      });
    }

    // Check permission
    if (req.user?.role === 'siswa') {
      if (journal.user_id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Tidak memiliki akses ke jurnal ini'
        });
      }
      // Siswa can only edit if status is pending or rejected
      if (journal.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Jurnal yang sudah disetujui tidak dapat diubah'
        });
      }
    }

    // Update fields
    if (tanggal) {
      // Check if new date conflicts with existing journal
      const existingJournal = await Jurnal.findOne({
        _id: { $ne: id },
        user_id: journal.user_id,
        tanggal: new Date(tanggal)
      });

      if (existingJournal) {
        return res.status(400).json({
          success: false,
          message: 'Jurnal untuk tanggal ini sudah ada'
        });
      }

      journal.tanggal = new Date(tanggal);
    }

    if (kegiatan) journal.kegiatan = kegiatan;
    if (dokumentasi !== undefined) journal.link_dokumentasi = dokumentasi;
    
    // Only admin/guru can change status
    if (status && ['admin', 'guru'].includes(req.user?.role || '')) {
      journal.status = status;
    }

    await journal.save();
    await journal.populate('user_id', 'nama email nis kelas');

    res.json({
      success: true,
      message: 'Jurnal berhasil diperbarui',
      data: journal
    });
  } catch (error) {
    console.error('Update journal error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui jurnal'
    });
  }
};

/**
 * Delete journal entry
 * @route DELETE /api/jurnal/:id
 * @access Siswa (own data), Admin, Guru
 */
export const deleteJurnal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID jurnal tidak valid'
      });
    }

    const journal = await Jurnal.findById(id);
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Jurnal tidak ditemukan'
      });
    }

    // Check permission
    if (req.user?.role === 'siswa') {
      if (journal.user_id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Tidak memiliki akses ke jurnal ini'
        });
      }
      // Siswa can only delete if status is pending or rejected
      if (journal.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Jurnal yang sudah disetujui tidak dapat dihapus'
        });
      }
    }

    // Delete associated comments
    await Comment.deleteMany({ jurnal_id: id });

    // Delete journal
    await Jurnal.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Jurnal berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete journal error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus jurnal'
    });
  }
};

/**
 * Add comment to journal
 * @route POST /api/jurnal/:id/comment
 * @access Admin, Guru
 */
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { komentar } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID jurnal tidak valid'
      });
    }

    if (!komentar || komentar.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Komentar wajib diisi'
      });
    }

    // Check if journal exists
    const journal = await Jurnal.findById(id);
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Jurnal tidak ditemukan'
      });
    }

    // Only admin and guru can add comments
    if (!['admin', 'guru'].includes(req.user?.role || '')) {
      return res.status(403).json({
        success: false,
        message: 'Hanya admin dan guru yang dapat menambahkan komentar'
      });
    }

    const comment = new Comment({
      jurnal_id: id,
      user_id: req.user.id,
      komentar: komentar.trim()
    });

    await comment.save();
    await comment.populate('user_id', 'nama email role');

    res.status(201).json({
      success: true,
      message: 'Komentar berhasil ditambahkan',
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan komentar'
    });
  }
};

/**
 * Update comment
 * @route PUT /api/jurnal/comment/:commentId
 * @access Admin, Guru (own comments)
 */
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { komentar } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID komentar tidak valid'
      });
    }

    if (!komentar || komentar.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Komentar wajib diisi'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Komentar tidak ditemukan'
      });
    }

    // Check permission
    if (req.user?.role !== 'admin' && comment.user_id.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki akses ke komentar ini'
      });
    }

    comment.komentar = komentar.trim();
    await comment.save();
    await comment.populate('user_id', 'nama email role');

    res.json({
      success: true,
      message: 'Komentar berhasil diperbarui',
      data: comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui komentar'
    });
  }
};

/**
 * Delete comment
 * @route DELETE /api/jurnal/comment/:commentId
 * @access Admin, Guru (own comments)
 */
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID komentar tidak valid'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Komentar tidak ditemukan'
      });
    }

    // Check permission
    if (req.user?.role !== 'admin' && comment.user_id.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki akses ke komentar ini'
      });
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({
      success: true,
      message: 'Komentar berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus komentar'
    });
  }
};

/**
 * Review journal (approve/reject)
 * @route PUT /api/jurnal/:id/review
 * @access Admin, Guru
 */
export const reviewJurnal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, komentar } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID jurnal tidak valid'
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status harus approved atau rejected'
      });
    }

    // Only admin and guru can review
    if (!['admin', 'guru'].includes(req.user?.role || '')) {
      return res.status(403).json({
        success: false,
        message: 'Hanya admin dan guru yang dapat mereview jurnal'
      });
    }

    const journal = await Jurnal.findById(id);
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Jurnal tidak ditemukan'
      });
    }

    // Update journal status
    journal.status = status;
    await journal.save();

    // Add comment if provided
    if (komentar && komentar.trim().length > 0) {
      const comment = new Comment({
        jurnal_id: id,
        user_id: req.user.id,
        komentar: komentar.trim()
      });
      await comment.save();
    }

    await journal.populate('user_id', 'nama email nis kelas');

    res.json({
      success: true,
      message: `Jurnal berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
      data: journal
    });
  } catch (error) {
    console.error('Review journal error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mereview jurnal'
    });
  }
};