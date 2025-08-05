/**
 * Journal (Jurnal) API routes
 * Handle journal entries, comments, and review operations
 */
import { Router } from 'express';
import {
  getJurnals,
  getJurnalById,
  createJurnal,
  updateJurnal,
  deleteJurnal,
  addComment,
  updateComment,
  deleteComment,
  reviewJurnal
} from '../controllers/jurnalController.ts';
import {
  authenticateToken,
  adminOrGuru,
  allRoles
} from '../middleware/auth.ts';

const router = Router();

/**
 * Get all journals with pagination and filtering
 * GET /api/jurnal
 * @headers Authorization: Bearer <token>
 * @query page, limit, user_id?, start_date?, end_date?, status?, tempat_pkl?, search?
 * @access All authenticated users (siswa see own data, admin/guru see all)
 */
router.get('/', authenticateToken, allRoles, getJurnals);

/**
 * Get journal by ID with comments
 * GET /api/jurnal/:id
 * @headers Authorization: Bearer <token>
 * @access All authenticated users (siswa see own data, admin/guru see all)
 */
router.get('/:id', authenticateToken, allRoles, getJurnalById);

/**
 * Create new journal entry
 * POST /api/jurnal
 * @headers Authorization: Bearer <token>
 * @body { tanggal, kegiatan, dokumentasi? }
 * @access Siswa only
 */
router.post('/', authenticateToken, allRoles, createJurnal);

/**
 * Update journal entry
 * PUT /api/jurnal/:id
 * @headers Authorization: Bearer <token>
 * @body { tanggal?, kegiatan?, dokumentasi?, status? }
 * @access Siswa (own data), Admin, Guru
 */
router.put('/:id', authenticateToken, allRoles, updateJurnal);

/**
 * Delete journal entry
 * DELETE /api/jurnal/:id
 * @headers Authorization: Bearer <token>
 * @access Siswa (own data), Admin, Guru
 */
router.delete('/:id', authenticateToken, allRoles, deleteJurnal);

/**
 * Review journal (approve/reject)
 * PUT /api/jurnal/:id/review
 * @headers Authorization: Bearer <token>
 * @body { status: 'approved' | 'rejected', komentar? }
 * @access Admin, Guru only
 */
router.put('/:id/review', authenticateToken, adminOrGuru, reviewJurnal);

/**
 * Add comment to journal
 * POST /api/jurnal/:id/comment
 * @headers Authorization: Bearer <token>
 * @body { komentar }
 * @access Admin, Guru only
 */
router.post('/:id/comment', authenticateToken, adminOrGuru, addComment);

/**
 * Update comment
 * PUT /api/jurnal/comment/:commentId
 * @headers Authorization: Bearer <token>
 * @body { komentar }
 * @access Admin, Guru (own comments)
 */
router.put('/comment/:commentId', authenticateToken, adminOrGuru, updateComment);

/**
 * Delete comment
 * DELETE /api/jurnal/comment/:commentId
 * @headers Authorization: Bearer <token>
 * @access Admin, Guru (own comments)
 */
router.delete('/comment/:commentId', authenticateToken, adminOrGuru, deleteComment);

export default router;