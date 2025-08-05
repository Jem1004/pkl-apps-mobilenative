import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  _id: string;
  key: string;
  value: any;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

const SettingsSchema: Schema = new Schema({
  key: {
    type: String,
    required: [true, 'Key is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Key cannot exceed 100 characters']
  },
  value: {
    type: Schema.Types.Mixed,
    required: [true, 'Value is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Note: key field already has index from unique: true

const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings;