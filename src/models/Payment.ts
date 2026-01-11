// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  provider: 'stripe' | 'paypal';
  amount: number; // Stored in major units (e.g., 20.00)
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  providerIds: {
    checkoutSessionId?: string; // For Stripe Webhooks
    paymentIntentId?: string;
    clientSecret?: string;
    orderId?: string; // For PayPal
    captureId?: string;
  };
  refundAmount: number; // For "Safety Net" functionality
  refundProviderId?: string;
  refundedAt?: Date;
  meta?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    provider: { type: String, enum: ['stripe', 'paypal'], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true }, // Normalized to USD
    status: { 
      type: String, 
      enum: ['pending', 'succeeded', 'failed', 'refunded'], 
      default: 'pending' 
    },
    providerIds: {
      checkoutSessionId: { type: String },
      paymentIntentId: { type: String },
      clientSecret: { type: String },
      orderId: { type: String },
      captureId: { type: String },
    },
    refundAmount: { type: Number, default: 0 },
    refundProviderId: { type: String },
    refundedAt: { type: Date },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

/* ----------------------------- Indexes ----------------------------- */
// Essential for fast Webhook lookups
PaymentSchema.index({ 'providerIds.checkoutSessionId': 1 });
PaymentSchema.index({ 'providerIds.paymentIntentId': 1 });
PaymentSchema.index({ 'providerIds.orderId': 1 });
PaymentSchema.index({ lesson: 1 });
PaymentSchema.index({ user: 1 });

/**
 * World-Class Addition: Replaces the external 'markPaid.js' script 
 * with a built-in method for Admin UI buttons.
 */
PaymentSchema.statics.adminUpdateStatus = async function(paymentId: string, status: string) {
  return this.findByIdAndUpdate(paymentId, { status }, { new: true });
};

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
