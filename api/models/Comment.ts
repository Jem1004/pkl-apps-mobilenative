import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  _id: string;
  jurnal_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  komentar: string;
  created_at: Date;
  updated_at: Date;
}

const CommentSchema: Schema = new Schema({
  jurnal_id: {
    type: Schema.Types.ObjectId,
    ref: 'Jurnal',
    required: [true, 'Jurnal ID is required']
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  komentar: {
    type: String,
    required: [true, 'Komentar is required'],
    trim: true,
    minlength: [1, 'Komentar cannot be empty'],
    maxlength: [1000, 'Komentar cannot exceed 1000 characters']
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better performance
CommentSchema.index({ jurnal_id: 1, created_at: -1 });
CommentSchema.index({ user_id: 1, created_at: -1 });

const Comment = mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;