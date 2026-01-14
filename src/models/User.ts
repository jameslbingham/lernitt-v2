// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'tutor' | 'admin';
  isTutor: boolean;
  tutorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  bio?: string;
  subjectIds: mongoose.Types.ObjectId[]; 
  hourlyRate: number; 
  preferredCurrency: string;
  avatar?: string;
  stripeAccountId?: string;
  paypalEmail?: string;
  // Added for Bob's PayPal preference
  withdrawalMethod: 'Stripe' | 'PayPal'; 
  payoutsEnabled: boolean;
  isAdmin: boolean;
  country?: string;
  timezone: string; 
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
    tutorStatus: { 
      type: String, 
      enum: ['none', 'pending', 'approved', 'rejected'], 
      default: 'none' 
    },
    bio: { type: String },
    subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    hourlyRate: { type: Number, default: 0 },
    preferredCurrency: { type: String, default: 'USD' },
    avatar: { type: String },
    stripeAccountId: { type: String },
    paypalEmail: { type: String },
    // Logic for Bob to elect PayPal in his profile
    withdrawalMethod: { type: String, enum: ['Stripe', 'PayPal'], default: 'Stripe' },
    payoutsEnabled: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    country: { type: String },
    timezone: { type: String, default: 'UTC' },
    totalEarnings: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ tutorStatus: 1 });
UserSchema.index({ subjectIds: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
