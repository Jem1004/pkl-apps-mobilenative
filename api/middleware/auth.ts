import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/index.ts';

// Extend Request interface to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface JWTPayload extends jwt.JwtPayload {
  id: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
}

// Generate JWT token
export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const options: jwt.SignOptions = {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  } as jwt.SignOptions;
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string || 'fallback_secret',
    options
  );
};

// Verify JWT token middleware
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string || 'fallback_secret'
    ) as JWTPayload;

    // Get user from database to ensure user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    if (user.status !== 'aktif') {
      res.status(401).json({
        success: false,
        error: 'User account is inactive'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Authentication error'
      });
    }
  }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles: Array<'admin' | 'guru' | 'siswa'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(', ')}`
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorizeRoles('admin');

// Admin and Guru middleware
export const adminOrGuru = authorizeRoles('admin', 'guru');

// All authenticated users middleware
export const allRoles = authorizeRoles('admin', 'guru', 'siswa');

// Self or admin access (for user profile operations)
export const selfOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  const targetUserId = req.params.id || req.params.userId;
  
  if (req.user.role === 'admin' || req.user._id.toString() === targetUserId) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own data.'
    });
  }
};