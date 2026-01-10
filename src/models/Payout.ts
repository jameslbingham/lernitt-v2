// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayout extends Document {
  lesson: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  amountCents: number;
  currency: string;
  provider: 'stripe' | 'paypal';
  status: 'queued' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  providerId?: string;
  error?: string;
  paidAt?: Date;
}

const PayoutSchema: Schema = new Schema(
  {
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    tutor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amountCents: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    provider: { type: String, enum: ['stripe', 'paypal'], required: true },
    status: { 
      type: String, 
      enum: ['queued', 'processing', 'succeeded', 'failed', 'cancelled'], 
      default: 'queued' 
    },
    providerId: { type: String },
    error: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

const Payout: Model<IPayout> = mongoose.models.Payout || mongoose.model<IPayout>('Payout', PayoutSchema);
export default Payout;
