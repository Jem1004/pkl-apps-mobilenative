/**
 * Reports API routes
 * Handle data export and dashboard statistics
 */
import { Router } from 'express';
import {
  exportAttendanceExcel,
  exportJournalExcel,
  exportAttendancePDF,
  getDashboardStats
} from '../controllers/reportController.ts';
import {
  authenticateToken,
  adminOrGuru
} from '../middleware/auth.ts';

const router = Router();

/**
 * Export attendance report to Excel
 * GET /api/reports/attendance/excel
 * @headers Authorization: Bearer <token>
 * @query start_date?, end_date?, user_id?, tempat_pkl?, status?, kelas?
 * @access Admin, Guru only
 */
router.get('/attendance/excel', authenticateToken, adminOrGuru, exportAttendanceExcel);

/**
 * Export journal report to Excel
 * GET /api/reports/journal/excel
 * @headers Authorization: Bearer <token>
 * @query start_date?, end_date?, user_id?, tempat_pkl?, status?, kelas?
 * @access Admin, Guru only
 */
router.get('/journal/excel', authenticateToken, adminOrGuru, exportJournalExcel);

/**
 * Export attendance report to PDF
 * GET /api/reports/attendance/pdf
 * @headers Authorization: Bearer <token>
 * @query start_date?, end_date?, user_id?, tempat_pkl?, status?, kelas?
 * @access Admin, Guru only
 */
router.get('/attendance/pdf', authenticateToken, adminOrGuru, exportAttendancePDF);

/**
 * Get dashboard statistics
 * GET /api/reports/dashboard-stats
 * @headers Authorization: Bearer <token>
 * @query tempat_pkl?, kelas?
 * @access Admin, Guru only
 */
router.get('/dashboard-stats', authenticateToken, adminOrGuru, getDashboardStats);

export default router;