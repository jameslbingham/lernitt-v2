// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Validates if a lesson can be rescheduled based on the 24-hour rule.
 */
export function canReschedule(startTime: Date): boolean {
  const now = new Date();
  const lessonStart = new Date(startTime);
  const diffInHours = (lessonStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  // Business rule: No changes allowed within 24 hours
  return diffInHours >= 24;
}

/**
 * Initiates a reschedule request while maintaining USD financial integrity.
 */
export async function requestReschedule(
  lessonId: string, 
  userId: string, 
  newStartTime: string, 
  newEndTime: string
) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(lessonId) });
  if (!lesson) return { success: false, reason: 'Lesson not found' };

  // 1. Authorization Guard
  const isStudent = lesson.student.toString() === userId;
  const isTutor = lesson.tutor.toString() === userId;
  if (!isStudent && !isTutor) return { success: false, reason: 'Not authorized' };

  // 2. 24-Hour Rule Guard
  if (!canReschedule(lesson.startTime)) {
    return { success: false, reason: 'Cannot reschedule within 24 hours of start time' };
  }

  // 3. Status Guard
  if (['cancelled', 'completed', 'expired'].includes(lesson.status)) {
    return { success: false, reason: `Cannot reschedule a ${lesson.status} lesson` };
  }

  // 4. Update the lesson with pending UTC times
  // Note: The price and currency (USD) remain locked as per the original booking.
  await db.collection('lessons').updateOne(
    { _id: new ObjectId(lessonId) },
    { 
      $set: { 
        status: 'reschedule_requested',
        // Convert input strings to standardized UTC Date objects
        pendingStartTime: new Date(newStartTime),
        pendingEndTime: new Date(newEndTime),
        rescheduleRequestedBy: isStudent ? 'student' : 'tutor',
        updatedAt: new Date()
      } 
    }
  );

  return { success: true, message: 'Reschedule request sent' };
}
