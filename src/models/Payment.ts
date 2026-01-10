// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  provider: 'stripe' | 'paypal';
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  providerIds: {
    checkoutSessionId?: string;
    orderId?: string;
  };
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    provider: { type: String, enum: ['stripe', 'paypal'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
    providerIds: {
      checkoutSessionId: { type: String },
      orderId: { type: String },
    },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
