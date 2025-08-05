/**
 * Authentication API routes
 * Handle user login, profile management, password changes, etc.
 */
import { Router } from 'express';
import {
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.ts';
import { authenticateToken, allRoles } from '../middleware/auth.ts';

const router = Router();

/**
 * User Login
 * POST /api/auth/login
 * @body { email: string, password: string }
 */
router.post('/login', login);

/**
 * Get Current User Profile
 * GET /api/auth/profile
 * @headers Authorization: Bearer <token>
 */
router.get('/profile', authenticateToken, allRoles, getProfile);

/**
 * Update User Profile
 * PUT /api/auth/profile
 * @headers Authorization: Bearer <token>
 * @body { nama?: string, email?: string, kelas?: string }
 */
router.put('/profile', authenticateToken, allRoles, updateProfile);

/**
 * Change Password
 * PUT /api/auth/change-password
 * @headers Authorization: Bearer <token>
 * @body { currentPassword: string, newPassword: string }
 */
router.put('/change-password', authenticateToken, allRoles, changePassword);

export default router;