// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson extends Document {
  tutorId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  // Link to the 3-layer Category (Topic > Subject > Sub-category)
  categoryId: mongoose.Types.ObjectId;
  scheduledTime: Date;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
  // Sophisticated tracking fields for curriculum and retention
  curriculumUnit?: string;
  progressNote?: string;
  studentRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema: Schema = new Schema(
  {
    tutorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Connects this lesson to a specific branch of the 3-layer hierarchy
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    scheduledTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled'], 
      default: 'scheduled' 
    },
    price: { type: Number, required: true },
    // Used for granular lesson titles (e.g., "Lesson 4: Advanced Fractions")
    curriculumUnit: { type: String },
    // Critical for retention: what the tutor needs to prep for next time
    progressNote: { type: String },
    studentRating: { type: Number },
  },
  { timestamps: true }
);

// High-performance indexes for sophisticated dashboard analytics
LessonSchema.index({ tutorId: 1 });
LessonSchema.index({ studentId: 1 });
LessonSchema.index({ categoryId: 1 });
LessonSchema.index({ status: 1 });
LessonSchema.index({ scheduledTime: -1 });

const Lesson: Model<ILesson> = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
export default Lesson;
