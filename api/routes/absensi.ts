/**
 * Attendance (Absensi) API routes
 * Handle check in/out, attendance history, and statistics
 */
import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAttendanceStats,
  createManualAttendance
} from '../controllers/absensiController.ts';
import {
  authenticateToken,
  adminOrGuru,
  allRoles
} from '../middleware/auth.ts';

const router = Router();

/**
 * Check In (Absen Masuk)
 * POST /api/absensi/check-in
 * @headers Authorization: Bearer <token>
 * @body { keterangan_masuk?: string }
 * @access Siswa only
 */
router.post('/check-in', authenticateToken, allRoles, checkIn);

/**
 * Check Out (Absen Pulang)
 * POST /api/absensi/check-out
 * @headers Authorization: Bearer <token>
 * @body { keterangan_pulang?: string }
 * @access Siswa only
 */
router.post('/check-out', authenticateToken, allRoles, checkOut);

/**
 * Get Today's Attendance Status
 * GET /api/absensi/today
 * @headers Authorization: Bearer <token>
 * @access All authenticated users
 */
router.get('/today', authenticateToken, allRoles, getTodayAttendance);

/**
 * Get Attendance History
 * GET /api/absensi/history
 * @headers Authorization: Bearer <token>
 * @query page, limit, user_id?, start_date?, end_date?, status?, tempat_pkl?
 * @access All authenticated users (siswa see own data, admin/guru see all)
 */
router.get('/history', authenticateToken, allRoles, getAttendanceHistory);

/**
 * Get Attendance Statistics
 * GET /api/absensi/stats
 * @headers Authorization: Bearer <token>
 * @query user_id?, start_date?, end_date?, tempat_pkl?
 * @access All authenticated users (siswa see own data, admin/guru see all)
 */
router.get('/stats', authenticateToken, allRoles, getAttendanceStats);

/**
 * Create Manual Attendance Entry
 * POST /api/absensi/manual
 * @headers Authorization: Bearer <token>
 * @body { user_id, tanggal, jam_masuk?, jam_pulang?, keterangan_masuk?, keterangan_pulang?, status }
 * @access Admin, Guru only
 */
router.post('/manual', authenticateToken, adminOrGuru, createManualAttendance);

export default router;