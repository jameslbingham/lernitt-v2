// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayout extends Document {
  lesson: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  payment: mongoose.Types.ObjectId; // Link to the original student payment
  amountGross: number; // Total student paid (cents)
  amountNet: number;   // Tutor's 85% share (cents) - map to amountCents
  platformFee: number; // Lernitt's 15% share (cents)
  amountCents: number; // Legacy/Sync field for Tutor share
  amount: number;      // Stored base-unit USD
  currency: string;
  provider: 'stripe' | 'paypal';
  providerId?: string;
  status: 'queued' | 'processing' | 'paid' | 'succeeded' | 'failed';
  error?: string;
  paidAt?: Date;
  txnId?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  markProcessing: () => Promise<IPayout>;
  markSucceeded: (providerId?: string) => Promise<IPayout>;
  markFailed: (err: any) => Promise<IPayout>;
}

const PayoutSchema: Schema = new Schema(
  {
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    tutor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },

    // Financial breakdown (The Marketplace Engine)
    amountGross: { type: Number, required: true, min: 0 },
    amountNet: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },

    // Core monetary fields (Synced)
    amountCents: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 }, 

    currency: {
      type: String,
      default: 'USD',
      set: (v: string) => (typeof v === 'string' ? v.toUpperCase() : v),
      trim: true,
    },

    provider: { type: String, enum: ['stripe', 'paypal'], required: true },
    providerId: { type: String },

    status: {
      type: String,
      enum: ['queued', 'processing', 'paid', 'succeeded', 'failed'],
      default: 'queued',
      index: true,
    },
    error: { type: String },

    paidAt: { type: Date },
    txnId: { type: String },
    note: { type: String },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* ----------------------------- Indexes ----------------------------- */
PayoutSchema.index({ tutor: 1, createdAt: -1 });
PayoutSchema.index({ status: 1, createdAt: -1 });

/* ------------------------ Amount sync helpers ---------------------- */
/**
 * Ensures amountNet, amountCents, and amount (USD) are always in perfect sync.
 */
function syncAmounts(doc: any) {
  // We treat amountNet as the source of truth for the tutor's payout
  if (typeof doc.amountNet === 'number') {
    doc.amountCents = doc.amountNet;
    doc.amount = Math.round((doc.amountNet / 100) * 100) / 100;
  }
}

PayoutSchema.pre('validate', function (next) {
  syncAmounts(this);
  next();
});

PayoutSchema.pre('save', function (next) {
  syncAmounts(this);
  next();
});

/* ----------------------------- Virtuals ---------------------------- */
PayoutSchema.virtual('amountFormatted').get(function () {
  return (this.amountCents / 100).toFixed(2);
});

/* ------------------------------ Methods ---------------------------- */
PayoutSchema.methods.markProcessing = function () {
  this.status = 'processing';
  this.error = undefined;
  return this.save();
};

PayoutSchema.methods.markSucceeded = function (providerId?: string) {
  this.status = 'succeeded';
  this.providerId = providerId || this.providerId;
  this.error = undefined;
  this.paidAt = this.paidAt || new Date();
  return this.save();
};

PayoutSchema.methods.markFailed = function (err: any) {
  this.status = 'failed';
  this.error = err ? String(err) : 'Unknown error';
  return this.save();
};

const Payout: Model<IPayout> = mongoose.models.Payout || mongoose.model<IPayout>('Payout', PayoutSchema);
export default Payout;
