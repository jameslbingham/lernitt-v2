import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define the interface for the Lesson document
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
const LessonSchema: Schema = new Schema(
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
    // Fields for curriculum tracking and retention data
    curriculumUnit: { type: String },
    progressNote: { type: String },
    studentRating: { type: Number },
  },
  { timestamps: true }
);

// 3. Export the model, ensuring we don't redefine it if it already exists
const Lesson: Model<ILesson> = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);

export default Lesson;
