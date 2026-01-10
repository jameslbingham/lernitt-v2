// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  provider: 'stripe' | 'paypal';
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  providerIds: {
    checkoutSessionId?: string;
    paymentIntentId?: string;
    orderId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    provider: { type: String, enum: ['stripe', 'paypal'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    status: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
    providerIds: {
      checkoutSessionId: { type: String },
      paymentIntentId: { type: String },
      orderId: { type: String },
    },
  },
  { timestamps: true }
);

// Index for webhook lookups (from your v1 logic)
PaymentSchema.index({ 'providerIds.checkoutSessionId': 1 });
PaymentSchema.index({ 'providerIds.orderId': 1 });

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
