// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayout extends Document {
  lesson: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  amountCents: number;
  amount: number;
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

    // Monetary amounts
    amountCents: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 }, // stored base-unit USD

    currency: {
      type: String,
      default: 'USD', // Normalized to USD
      set: (v: string) => (typeof v === 'string' ? v.toUpperCase() : v),
      trim: true,
    },

    // Provider transfer metadata
    provider: { type: String, enum: ['stripe', 'paypal'], required: true },
    providerId: { type: String },

    // Lifecycle statuses from v1
    status: {
      type: String,
      enum: ['queued', 'processing', 'paid', 'succeeded', 'failed'],
      default: 'queued',
      index: true,
    },
    error: { type: String },

    // Admin/manual fields
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
 * Ported V1 Precision: Ensure `amount` and `amountCents` stay in sync.
 */
function syncAmounts(doc: any) {
  const hasAmount = typeof doc.amount === 'number' && !Number.isNaN(doc.amount);
  const hasCents = typeof doc.amountCents === 'number' && Number.isInteger(doc.amountCents);

  if (hasCents) {
    // cents is source of truth
    doc.amount = Math.round((doc.amountCents / 100) * 100) / 100;
  } else if (hasAmount) {
    // derive cents from amount
    doc.amountCents = Math.round(doc.amount * 100);
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
  const v = typeof this.amount === 'number' ? this.amount : (this.amountCents || 0) / 100;
  return v.toFixed(2);
});

/* ------------------------------ Methods ---------------------------- */
/**
 * Lifecycle Methods Ported from V1
 */
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
