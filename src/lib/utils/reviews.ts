// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { updateTutorRating } from './aggregates';

/**
 * Handles the submission of a student review.
 * Includes both the numerical rating and the written comment.
 */
export async function submitReview(data: {
  lessonId: string;
  studentId: string;
  rating: number;
  comment?: string;
}) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  // 1. Fetch the lesson to verify it is eligible for a review
  const lesson = await db.collection('lessons').findOne({ 
    _id: new ObjectId(data.lessonId) 
  });
  
  if (!lesson) return { success: false, reason: 'Lesson not found' };
  if (lesson.student.toString() !== data.studentId) return { success: false, reason: 'Not authorized' };
  if (lesson.status !== 'completed') return { success: false, reason: 'Only completed lessons can be reviewed' };

  // 2. Prevent duplicate reviews for the same lesson
  const existingReview = await db.collection('reviews').findOne({ 
    lesson: new ObjectId(data.lessonId) 
  });
  if (existingReview) return { success: false, reason: 'Review already exists for this lesson' };

  // 3. Insert the new Review (Written + Rating)
  const newReview = {
    lesson: new ObjectId(data.lessonId),
    tutor: lesson.tutor,
    student: new ObjectId(data.studentId),
    rating: data.rating,
    comment: data.comment || "",
    createdAt: new Date(),
  };

  const result = await db.collection('reviews').insertOne(newReview);

  // 4. Update the Tutor's Aggregated Score instantly
  await updateTutorRating(lesson.tutor.toString());
  
  return { success: true, reviewId: result.insertedId };
}
