import mongoose, { Schema, model, models, Document } from 'mongoose';

// 1. Define the interface
export interface ILesson extends Document {
  tutorId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  scheduledTime: Date;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
  curriculumUnit?: string;
  progressNote?: string;
  studentRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the Schema
const LessonSchema = new Schema(
  {
    tutorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled'], 
      default: 'scheduled' 
    },
    price: { type: Number, required: true },
    curriculumUnit: { type: String },
    progressNote: { type: String },
    studentRating: { type: Number },
  },
  { timestamps: true }
);

// 3. Export the model using the standard Next.js check
const Lesson = models.Lesson || model<ILesson>('Lesson', LessonSchema);

export default Lesson;
