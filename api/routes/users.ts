/**
 * User management API routes
 * Handle CRUD operations for users, import/export functionality
 */
import { Router } from 'express';
import multer from 'multer';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  importUsers,
  importUsersFromCSV,
  exportUsers
} from '../controllers/userController.ts';
import {
  authenticateToken,
  adminOnly,
  adminOrGuru,
  selfOrAdmin
} from '../middleware/auth.ts';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

/**
 * Get All Users
 * GET /api/users
 * @headers Authorization: Bearer <token>
 * @query page, limit, role, status, search, kelas, tempat_pkl
 * @access Admin, Guru
 */
router.get('/', authenticateToken, adminOrGuru, getUsers);

/**
 * Get User by ID
 * GET /api/users/:id
 * @headers Authorization: Bearer <token>
 * @access Admin, Guru, Self
 */
router.get('/:id', authenticateToken, selfOrAdmin, getUserById);

/**
 * Create New User
 * POST /api/users
 * @headers Authorization: Bearer <token>
 * @body { nama, email, password, role, nis?, nip?, kelas?, tempat_pkl?, status? }
 * @access Admin only
 */
router.post('/', authenticateToken, adminOnly, createUser);

/**
 * Update User
 * PUT /api/users/:id
 * @headers Authorization: Bearer <token>
 * @body { nama?, email?, role?, nis?, nip?, kelas?, tempat_pkl?, status? }
 * @access Admin only
 */
router.put('/:id', authenticateToken, adminOnly, updateUser);

/**
 * Delete User
 * DELETE /api/users/:id
 * @headers Authorization: Bearer <token>
 * @access Admin only
 */
router.delete('/:id', authenticateToken, adminOnly, deleteUser);

/**
 * Reset User Password
 * PUT /api/users/:id/reset-password
 * @headers Authorization: Bearer <token>
 * @body { newPassword }
 * @access Admin only
 */
router.put('/:id/reset-password', authenticateToken, adminOnly, resetPassword);

/**
 * Import Users from Excel
 * POST /api/users/import
 * @headers Authorization: Bearer <token>
 * @body FormData with 'file' field containing Excel file
 * @access Admin only
 */
router.post('/import', authenticateToken, adminOnly, upload.single('file'), importUsers);

/**
 * Import Users from CSV (Bulk Import)
 * POST /api/users/import-csv
 * @headers Authorization: Bearer <token>
 * @body { users: Array<UserData> }
 * @access Admin only
 */
router.post('/import-csv', authenticateToken, adminOnly, importUsersFromCSV);

/**
 * Export Users to Excel
 * GET /api/users/export
 * @headers Authorization: Bearer <token>
 * @query role?, status?, kelas?, tempat_pkl?
 * @access Admin, Guru
 */
router.get('/export', authenticateToken, adminOrGuru, exportUsers);

export default router;