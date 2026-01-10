// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson extends Document {
  tutor: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  subject: string;
  startTime: Date;
  endTime: Date;
  price: number;
  isPaid: boolean;
  status: 'booked' | 'paid' | 'confirmed' | 'completed' | 'cancelled';
}

const LessonSchema: Schema = new Schema(
  {
    tutor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    price: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ['booked', 'paid', 'confirmed', 'completed', 'cancelled'], 
      default: 'booked' 
    },
  },
  { timestamps: true }
);

const Lesson: Model<ILesson> = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
export default Lesson;
