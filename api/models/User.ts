import mongoose, { Document, Schema, SchemaDefinition } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  nama: string;
  username: string;
  email?: string; // Optional, will be auto-generated if not provided
  password: string;
  role: 'admin' | 'guru' | 'siswa';
  nis?: string; // Only for siswa
  nip?: string; // Only for guru
  kelas?: string; // Only for siswa
  status: 'aktif' | 'nonaktif';
  created_at: Date;
  updated_at: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchemaDefinition: SchemaDefinition<IUser> = {
  nama: {
    type: String,
    required: [true, 'Nama is required'],
    trim: true,
    maxlength: [100, 'Nama cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: false, // Made optional
    unique: true,
    sparse: true, // Allow multiple null values
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'guru', 'siswa'],
    default: 'siswa'
  },
  nis: {
    type: String,
    sparse: true,
    unique: true,
    validate: {
      validator: function(this: IUser, value: string) {
        return this.role !== 'siswa' || (value && value.length > 0);
      },
      message: 'NIS is required for siswa'
    }
  },
  nip: {
    type: String,
    sparse: true,
    unique: true,
    validate: {
      validator: function(this: IUser, value: string) {
        return this.role !== 'guru' || (value && value.length > 0);
      },
      message: 'NIP is required for guru'
    }
  },
  kelas: {
    type: String,
    validate: {
      validator: function(this: IUser, value: string) {
        return this.role !== 'siswa' || (value && value.length > 0);
      },
      message: 'Kelas is required for siswa'
    }
  },

  status: {
    type: String,
    enum: ['aktif', 'nonaktif'],
    default: 'aktif'
  }
};

const UserSchema = new Schema<IUser>(userSchemaDefinition, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});



// Auto-generate email if not provided
UserSchema.pre<IUser>('save', async function(next) {
  // Generate email if not provided
  if (!this.email) {
    const cleanNama = this.nama.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    this.email = `${cleanNama}_${this.role}@sekolah.com`;
  }
  
  next();
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better performance
// Note: email, nis, and nip already have indexes from unique: true
UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;