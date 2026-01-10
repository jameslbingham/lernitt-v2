// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdvancedAvailability extends Document {
  tutor: mongoose.Types.ObjectId;
  type: 'recurring' | 'override'; // 'recurring' = weekly template; 'override' = specific date change
  dayOfWeek?: number; // 0-6 (Used if type is 'recurring')
  specificDate?: Date; // (Used if type is 'override')
  slots: {
    startTime: string; // "09:00"
    endTime: string;   // "10:00"
    subjects: mongoose.Types.ObjectId[]; // Link to 3-layer categories
    isTrialAvailable: boolean; // Allow introductory lessons here?
  }[];
  active: boolean;
}

const AdvancedAvailabilitySchema: Schema = new Schema(
  {
    tutor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['recurring', 'override'], required: true },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    specificDate: { type: Date },
    slots: [{
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      subjects: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      isTrialAvailable: { type: Boolean, default: true }
    }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for the "italki-style" lookup engine
AdvancedAvailabilitySchema.index({ tutor: 1, type: 1, specificDate: 1 });
AdvancedAvailabilitySchema.index({ tutor: 1, type: 1, dayOfWeek: 1 });

const AdvancedAvailability: Model<IAdvancedAvailability> = mongoose.models.AdvancedAvailability || mongoose.model<IAdvancedAvailability>('AdvancedAvailability', AdvancedAvailabilitySchema);
export default AdvancedAvailability;
