/**
 * Tempat PKL management API routes
 * Handle CRUD operations for PKL locations
 */
import { Router } from 'express';
import {
  getTempatPKL,
  getAllTempatPKL,
  getTempatPKLById,
  createTempatPKL,
  updateTempatPKL,
  deleteTempatPKL,
  getStudentsByTempatPKL
} from '../controllers/tempatPKLController.ts';
import {
  authenticateToken,
  adminOnly,
  adminOrGuru,
  allRoles
} from '../middleware/auth.ts';

const router = Router();

/**
 * Get All Tempat PKL (with pagination and filtering)
 * GET /api/tempat-pkl
 * @headers Authorization: Bearer <token>
 * @query page, limit, status, search
 * @access Admin, Guru
 */
router.get('/', authenticateToken, adminOrGuru, getTempatPKL);

/**
 * Get All Tempat PKL (for dropdown/select)
 * GET /api/tempat-pkl/all
 * @headers Authorization: Bearer <token>
 * @access All authenticated users
 */
router.get('/all', authenticateToken, allRoles, getAllTempatPKL);

/**
 * Get Tempat PKL by ID
 * GET /api/tempat-pkl/:id
 * @headers Authorization: Bearer <token>
 * @access Admin, Guru
 */
router.get('/:id', authenticateToken, adminOrGuru, getTempatPKLById);

/**
 * Create New Tempat PKL
 * POST /api/tempat-pkl
 * @headers Authorization: Bearer <token>
 * @body { nama, alamat, kontak, email?, status? }
 * @access Admin only
 */
router.post('/', authenticateToken, adminOnly, createTempatPKL);

/**
 * Update Tempat PKL
 * PUT /api/tempat-pkl/:id
 * @headers Authorization: Bearer <token>
 * @body { nama?, alamat?, kontak?, email?, status? }
 * @access Admin only
 */
router.put('/:id', authenticateToken, adminOnly, updateTempatPKL);

/**
 * Delete Tempat PKL
 * DELETE /api/tempat-pkl/:id
 * @headers Authorization: Bearer <token>
 * @access Admin only
 */
router.delete('/:id', authenticateToken, adminOnly, deleteTempatPKL);

/**
 * Get Students by Tempat PKL
 * GET /api/tempat-pkl/:id/students
 * @headers Authorization: Bearer <token>
 * @query page, limit, status, search
 * @access Admin, Guru
 */
router.get('/:id/students', authenticateToken, adminOrGuru, getStudentsByTempatPKL);

export default router;