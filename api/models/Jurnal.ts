import mongoose, { Document, Schema } from 'mongoose';

export interface IJurnal extends Document {
  _id: string;
  user_id: mongoose.Types.ObjectId;
  tanggal: Date;
  kegiatan: string;
  link_dokumentasi?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

const JurnalSchema: Schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  tanggal: {
    type: Date,
    required: [true, 'Tanggal is required'],
    index: true,
    validate: {
      validator: function(value: Date) {
        return value <= new Date();
      },
      message: 'Tanggal cannot be in the future'
    }
  },
  kegiatan: {
    type: String,
    required: [true, 'Kegiatan is required'],
    trim: true,
    minlength: [10, 'Kegiatan must be at least 10 characters'],
    maxlength: [2000, 'Kegiatan cannot exceed 2000 characters']
  },
  link_dokumentasi: {
    type: String,
    trim: true,
    validate: {
      validator: function(value: string) {
        if (!value) return true;
        // Validate Google Drive link format
        const googleDriveRegex = /^https:\/\/drive\.google\.com\/(file\/d\/|drive\/folders\/|open\?id=)/;
        return googleDriveRegex.test(value);
      },
      message: 'Link dokumentasi must be a valid Google Drive link'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better performance
JurnalSchema.index({ user_id: 1, tanggal: -1 });
JurnalSchema.index({ status: 1, created_at: -1 });
JurnalSchema.index({ tanggal: 1, status: 1 });

const Jurnal = mongoose.model<IJurnal>('Jurnal', JurnalSchema);
export default Jurnal;