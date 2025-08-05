/**
 * Report Controller
 * Handle data export to Excel and PDF formats
 */
import { Request, Response } from 'express';
import { User } from '../models/User.ts';
import Absensi from '../models/Absensi.ts';
import Jurnal from '../models/Jurnal.ts';
import TempatPKL from '../models/TempatPKL.ts';
import { AuthRequest } from '../middleware/auth.ts';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';

/**
 * Export attendance report to Excel
 * @route GET /api/reports/attendance/excel
 * @access Admin, Guru
 */
export const exportAttendanceExcel = async (req: AuthRequest, res: Response) => {
  try {
    const {
      start_date,
      end_date,
      user_id,
      tempat_pkl,
      status,
      kelas
    } = req.query;

    // Build filter
    let filter: any = {};
    
    if (start_date || end_date) {
      filter.tanggal = {};
      if (start_date) filter.tanggal.$gte = new Date(start_date as string);
      if (end_date) filter.tanggal.$lte = new Date(end_date as string);
    }

    if (user_id) filter.user_id = user_id;
    if (status) filter.status = status;

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
          as: 'tempat_pkl_info'
        }
      },
      { $unwind: { path: '$tempat_pkl_info', preserveNullAndEmptyArrays: true } }
    ];

    // Filter by tempat PKL if specified
    if (tempat_pkl) {
      pipeline.push({
        $match: {
          'user.tempat_pkl': new mongoose.Types.ObjectId(tempat_pkl as string)
        }
      });
    }

    // Filter by class if specified
    if (kelas) {
      pipeline.push({
        $match: {
          'user.kelas': kelas
        }
      });
    }

    pipeline.push(
      {
        $project: {
          tanggal: 1,
          jam_masuk: 1,
          jam_pulang: 1,
          keterangan_masuk: 1,
          keterangan_pulang: 1,
          status: 1,
          'user.nama': 1,
          'user.nis': 1,
          'user.kelas': 1,
          'user.email': 1,
          'tempat_pkl_info.nama': 1
        }
      },
      { $sort: { tanggal: -1, 'user.nama': 1 } }
    );

    const attendanceData = await Absensi.aggregate(pipeline);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Absensi');

    // Set headers
    worksheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 12 },
      { header: 'Nama Siswa', key: 'nama', width: 25 },
      { header: 'NIS', key: 'nis', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 10 },
      { header: 'Tempat PKL', key: 'tempat_pkl', width: 30 },
      { header: 'Jam Masuk', key: 'jam_masuk', width: 12 },
      { header: 'Jam Pulang', key: 'jam_pulang', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Keterangan Masuk', key: 'keterangan_masuk', width: 20 },
      { header: 'Keterangan Pulang', key: 'keterangan_pulang', width: 20 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data
    attendanceData.forEach((record) => {
      worksheet.addRow({
        tanggal: record.tanggal.toLocaleDateString('id-ID'),
        nama: record.user.nama,
        nis: record.user.nis,
        kelas: record.user.kelas,
        tempat_pkl: record.tempat_pkl_info?.nama || '-',
        jam_masuk: record.jam_masuk ? record.jam_masuk.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        jam_pulang: record.jam_pulang ? record.jam_pulang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        status: record.status,
        keterangan_masuk: record.keterangan_masuk || '-',
        keterangan_pulang: record.keterangan_pulang || '-'
      });
    });

    // Set response headers
    const filename = `laporan-absensi-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export attendance Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengekspor laporan absensi'
    });
  }
};

/**
 * Export journal report to Excel
 * @route GET /api/reports/journal/excel
 * @access Admin, Guru
 */
export const exportJournalExcel = async (req: AuthRequest, res: Response) => {
  try {
    const {
      start_date,
      end_date,
      user_id,
      tempat_pkl,
      status,
      kelas
    } = req.query;

    // Build filter
    let filter: any = {};
    
    if (start_date || end_date) {
      filter.tanggal = {};
      if (start_date) filter.tanggal.$gte = new Date(start_date as string);
      if (end_date) filter.tanggal.$lte = new Date(end_date as string);
    }

    if (user_id) filter.user_id = user_id;
    if (status) filter.status = status;

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
          as: 'tempat_pkl_info'
        }
      },
      { $unwind: { path: '$tempat_pkl_info', preserveNullAndEmptyArrays: true } }
    ];

    // Filter by tempat PKL if specified
    if (tempat_pkl) {
      pipeline.push({
        $match: {
          'user.tempat_pkl': new mongoose.Types.ObjectId(tempat_pkl as string)
        }
      });
    }

    // Filter by class if specified
    if (kelas) {
      pipeline.push({
        $match: {
          'user.kelas': kelas
        }
      });
    }

    pipeline.push(
      {
        $project: {
          tanggal: 1,
          kegiatan: 1,
          dokumentasi: 1,
          status: 1,
          createdAt: 1,
          'user.nama': 1,
          'user.nis': 1,
          'user.kelas': 1,
          'user.email': 1,
          'tempat_pkl_info.nama': 1
        }
      },
      { $sort: { tanggal: -1, 'user.nama': 1 } }
    );

    const journalData = await Jurnal.aggregate(pipeline);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Jurnal');

    // Set headers
    worksheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 12 },
      { header: 'Nama Siswa', key: 'nama', width: 25 },
      { header: 'NIS', key: 'nis', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 10 },
      { header: 'Tempat PKL', key: 'tempat_pkl', width: 30 },
      { header: 'Kegiatan', key: 'kegiatan', width: 50 },
      { header: 'Dokumentasi', key: 'dokumentasi', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Dibuat', key: 'created_at', width: 15 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data
    journalData.forEach((record) => {
      worksheet.addRow({
        tanggal: record.tanggal.toLocaleDateString('id-ID'),
        nama: record.user.nama,
        nis: record.user.nis,
        kelas: record.user.kelas,
        tempat_pkl: record.tempat_pkl_info?.nama || '-',
        kegiatan: record.kegiatan,
        dokumentasi: record.dokumentasi || '-',
        status: record.status,
        created_at: record.createdAt.toLocaleDateString('id-ID')
      });
    });

    // Set response headers
    const filename = `laporan-jurnal-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export journal Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengekspor laporan jurnal'
    });
  }
};

/**
 * Export attendance report to PDF
 * @route GET /api/reports/attendance/pdf
 * @access Admin, Guru
 */
export const exportAttendancePDF = async (req: AuthRequest, res: Response) => {
  try {
    const {
      start_date,
      end_date,
      user_id,
      tempat_pkl,
      status,
      kelas
    } = req.query;

    // Build filter (same as Excel export)
    let filter: any = {};
    
    if (start_date || end_date) {
      filter.tanggal = {};
      if (start_date) filter.tanggal.$gte = new Date(start_date as string);
      if (end_date) filter.tanggal.$lte = new Date(end_date as string);
    }

    if (user_id) filter.user_id = user_id;
    if (status) filter.status = status;

    // Build aggregation pipeline (same as Excel export)
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
          as: 'tempat_pkl_info'
        }
      },
      { $unwind: { path: '$tempat_pkl_info', preserveNullAndEmptyArrays: true } }
    ];

    if (tempat_pkl) {
      pipeline.push({
        $match: {
          'user.tempat_pkl': new mongoose.Types.ObjectId(tempat_pkl as string)
        }
      });
    }

    if (kelas) {
      pipeline.push({
        $match: {
          'user.kelas': kelas
        }
      });
    }

    pipeline.push(
      {
        $project: {
          tanggal: 1,
          jam_masuk: 1,
          jam_pulang: 1,
          status: 1,
          'user.nama': 1,
          'user.nis': 1,
          'user.kelas': 1,
          'tempat_pkl_info.nama': 1
        }
      },
      { $sort: { tanggal: -1, 'user.nama': 1 } }
    );

    const attendanceData = await Absensi.aggregate(pipeline);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    const filename = `laporan-absensi-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(16).font('Helvetica-Bold').text('LAPORAN ABSENSI PKL', { align: 'center' });
    doc.moveDown();

    // Add filter info
    doc.fontSize(10).font('Helvetica');
    if (start_date || end_date) {
      const startStr = start_date ? new Date(start_date as string).toLocaleDateString('id-ID') : '-';
      const endStr = end_date ? new Date(end_date as string).toLocaleDateString('id-ID') : '-';
      doc.text(`Periode: ${startStr} s/d ${endStr}`);
    }
    if (status) doc.text(`Status: ${status}`);
    if (kelas) doc.text(`Kelas: ${kelas}`);
    doc.moveDown();

    // Table headers
    const tableTop = doc.y;
    const tableHeaders = ['Tanggal', 'Nama', 'NIS', 'Kelas', 'Masuk', 'Pulang', 'Status'];
    const columnWidths = [70, 120, 60, 50, 60, 60, 60];
    let currentX = 50;

    doc.fontSize(8).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, currentX, tableTop, { width: columnWidths[i], align: 'center' });
      currentX += columnWidths[i];
    });

    // Draw header line
    doc.moveTo(50, tableTop + 15).lineTo(530, tableTop + 15).stroke();

    // Add data rows
    let currentY = tableTop + 20;
    doc.font('Helvetica').fontSize(7);

    attendanceData.forEach((record, index) => {
      if (currentY > 700) { // New page if needed
        doc.addPage();
        currentY = 50;
      }

      currentX = 50;
      const rowData = [
        record.tanggal.toLocaleDateString('id-ID'),
        record.user.nama,
        record.user.nis,
        record.user.kelas,
        record.jam_masuk ? record.jam_masuk.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        record.jam_pulang ? record.jam_pulang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        record.status
      ];

      rowData.forEach((data, i) => {
        doc.text(data, currentX, currentY, { width: columnWidths[i], align: 'center' });
        currentX += columnWidths[i];
      });

      currentY += 15;
    });

    // Add footer
    doc.fontSize(8).text(`Generated on: ${new Date().toLocaleString('id-ID')}`, 50, doc.page.height - 50);

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Export attendance PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengekspor laporan absensi PDF'
    });
  }
};

/**
 * Get dashboard statistics
 * @route GET /api/reports/dashboard-stats
 * @access Admin, Guru
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const { tempat_pkl, kelas } = req.query;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Build user filter
    let userFilter: any = { role: 'siswa', status: 'active' };
    if (tempat_pkl) userFilter.tempat_pkl = tempat_pkl;
    if (kelas) userFilter.kelas = kelas;

    // Get total active students
    const totalStudents = await User.countDocuments(userFilter);

    // Get today's attendance stats
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const todayAttendanceStats = await Absensi.aggregate([
      {
        $match: {
          tanggal: { $gte: todayStart, $lte: todayEnd }
        }
      },
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
        $match: userFilter
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly journal stats
    const monthlyJournalStats = await Jurnal.aggregate([
      {
        $match: {
          tanggal: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
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
        $match: userFilter
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get PKL locations stats
    const pklLocationStats = await User.aggregate([
      {
        $match: userFilter
      },
      {
        $lookup: {
          from: 'tempatpkls',
          localField: 'tempat_pkl',
          foreignField: '_id',
          as: 'tempat_pkl_info'
        }
      },
      { $unwind: { path: '$tempat_pkl_info', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$tempat_pkl_info.nama',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Format response
    const attendanceToday = {
      hadir: todayAttendanceStats.find(s => s._id === 'hadir')?.count || 0,
      terlambat: todayAttendanceStats.find(s => s._id === 'terlambat')?.count || 0,
      alpha: totalStudents - (todayAttendanceStats.reduce((sum, s) => sum + s.count, 0))
    };

    const journalThisMonth = {
      pending: monthlyJournalStats.find(s => s._id === 'pending')?.count || 0,
      approved: monthlyJournalStats.find(s => s._id === 'approved')?.count || 0,
      rejected: monthlyJournalStats.find(s => s._id === 'rejected')?.count || 0
    };

    res.json({
      success: true,
      data: {
        total_students: totalStudents,
        attendance_today: attendanceToday,
        journal_this_month: journalThisMonth,
        pkl_locations: pklLocationStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik dashboard'
    });
  }
};