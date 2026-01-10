// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'booking' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  link?: string; // e.g., link to the specific lesson or review
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['booking', 'payment', 'review', 'system'], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

// Index for fast fetching of unread notifications for a specific user
NotificationSchema.index({ recipient: 1, isRead: 1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
