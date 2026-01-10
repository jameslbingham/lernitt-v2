import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'tutor' | 'admin';
  isTutor: boolean;
  tutorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  bio?: string;
  subjects: string[];
  price: number; // Hourly rate
  avatar?: string;
  stripeAccountId?: string;
  paypalEmail?: string;
  payoutsEnabled: boolean;
  isAdmin: boolean;
  country?: string;
  timezone?: string;
  totalEarnings: number;
  totalLessons: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    role: { type: String, enum: ['student', 'tutor', 'admin'], default: 'student' },
    isTutor: { type: Boolean, default: false },
    tutorStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    bio: { type: String },
    subjects: [{ type: String }],
    price: { type: Number, default: 0 },
    avatar: { type: String },
    stripeAccountId: { type: String },
    paypalEmail: { type: String },
    payoutsEnabled: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    country: { type: String },
    timezone: { type: String },
    totalEarnings: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for fast searching (from your v1)
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ tutorStatus: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
