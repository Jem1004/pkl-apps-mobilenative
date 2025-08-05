import mongoose, { Document, Schema } from 'mongoose';

export interface ITempatPKL extends Document {
  _id: string;
  nama: string;
  alamat?: string;
  kontak?: string;
  email?: string;
  status: 'aktif' | 'nonaktif';
  created_at: Date;
  updated_at: Date;
}

const TempatPKLSchema: Schema = new Schema({
  nama: {
    type: String,
    required: [true, 'Nama tempat PKL is required'],
    trim: true,
    maxlength: [200, 'Nama cannot exceed 200 characters']
  },
  alamat: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Alamat cannot exceed 500 characters']
  },
  kontak: {
    type: String,
    required: false,
    trim: true,
    maxlength: [20, 'Kontak cannot exceed 20 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  status: {
    type: String,
    enum: ['aktif', 'nonaktif'],
    default: 'aktif'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better performance
TempatPKLSchema.index({ nama: 1 });
TempatPKLSchema.index({ status: 1 });

const TempatPKL = mongoose.model<ITempatPKL>('TempatPKL', TempatPKLSchema);
export default TempatPKL;