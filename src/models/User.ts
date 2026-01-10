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
  // Linked to the 3-layer hierarchy (Topics, Subjects, Sub-categories)
  subjectIds: mongoose.Types.ObjectId[]; 
  // Financials now anchored to USD
  hourlyRate: number; 
  preferredCurrency: string;
  avatar?: string;
  stripeAccountId?: string;
  paypalEmail?: string;
  payoutsEnabled: boolean;
  isAdmin: boolean;
  country?: string;
  // Required for the CalendarEngine and global booking
  timezone: string; 
  totalEarnings: number; // Stored in USD
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
    // References the Category model for hierarchical filtering
    subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    // Renamed 'price' to 'hourlyRate' and set default master currency
    hourlyRate: { type: Number, default: 0 },
    preferredCurrency: { type: String, default: 'USD' },
    avatar: { type: String },
    stripeAccountId: { type: String },
    paypalEmail: { type: String },
    payoutsEnabled: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    country: { type: String },
    // Defaults to UTC, but will be updated during onboarding
    timezone: { type: String, default: 'UTC' },
    totalEarnings: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for fast search and filtering
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ tutorStatus: 1 });
UserSchema.index({ subjectIds: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
