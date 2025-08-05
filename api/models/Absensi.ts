import mongoose, { Document, Schema } from 'mongoose';

export interface IAbsensi extends Document {
  _id: string;
  user_id: mongoose.Types.ObjectId;
  tanggal: Date;
  jam_masuk?: Date;
  jam_pulang?: Date;
  keterangan_masuk?: string;
  keterangan_pulang?: string;
  status: 'hadir' | 'terlambat' | 'tidak_hadir' | 'izin' | 'sakit';
  created_at: Date;
  updated_at: Date;
}

const AbsensiSchema: Schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  tanggal: {
    type: Date,
    required: [true, 'Tanggal is required'],
    index: true
  },
  jam_masuk: {
    type: Date,
    validate: {
      validator: function(this: IAbsensi, value: Date) {
        return !value || value <= new Date();
      },
      message: 'Jam masuk cannot be in the future'
    }
  },
  jam_pulang: {
    type: Date,
    validate: {
      validator: function(this: IAbsensi, value: Date) {
        if (!value || !this.jam_masuk) return true;
        return value >= this.jam_masuk;
      },
      message: 'Jam pulang must be after jam masuk'
    }
  },
  keterangan_masuk: {
    type: String,
    trim: true,
    maxlength: [500, 'Keterangan masuk cannot exceed 500 characters']
  },
  keterangan_pulang: {
    type: String,
    trim: true,
    maxlength: [500, 'Keterangan pulang cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['hadir', 'terlambat', 'tidak_hadir', 'izin', 'sakit'],
    default: 'tidak_hadir'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index to ensure one attendance record per user per day
AbsensiSchema.index({ user_id: 1, tanggal: 1 }, { unique: true });

// Additional indexes for better performance
AbsensiSchema.index({ tanggal: 1, status: 1 });
AbsensiSchema.index({ user_id: 1, created_at: -1 });

// Pre-save middleware to automatically set status based on attendance time
AbsensiSchema.pre<IAbsensi>('save', function(next) {
  // Auto-determine status based on jam_masuk if not explicitly set
  if (this.jam_masuk && this.status === 'tidak_hadir') {
    // This logic can be enhanced with actual attendance time settings
    const jamMasukTime = this.jam_masuk.getHours() * 60 + this.jam_masuk.getMinutes();
    const batasWaktu = 8 * 60; // 08:00 in minutes
    
    if (jamMasukTime <= batasWaktu) {
      this.status = 'hadir';
    } else {
      this.status = 'terlambat';
    }
  }
  
  next();
});

const Absensi = mongoose.model<IAbsensi>('Absensi', AbsensiSchema);
export default Absensi;