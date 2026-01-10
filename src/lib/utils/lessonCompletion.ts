// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { queueTutorPayout } from './payouts';

/**
 * Marks a lesson as completed and triggers the payout process.
 * Implements safeguards from v1 lessons.js.
 */
export async function completeLesson(lessonId: string, tutorId: string) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  // 1. Fetch the lesson
  const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(lessonId) });
  if (!lesson) return { success: false, reason: 'Lesson not found' };

  // 2. Security Guard: Only the assigned tutor can complete it
  if (lesson.tutor.toString() !== tutorId) {
    return { success: false, reason: 'Not authorized: You are not the tutor for this lesson' };
  }

  // 3. Time Guard: Cannot complete before the lesson ends
  if (new Date(lesson.endTime) > new Date()) {
    return { success: false, reason: 'Lesson has not ended yet' };
  }

  // 4. Status Guard: Cannot complete a lesson that is already finished or cancelled
  const terminalStatuses = ['completed', 'cancelled', 'expired'];
  if (terminalStatuses.includes(lesson.status)) {
    return { success: false, reason: `Cannot complete a ${lesson.status} lesson` };
  }

  // 5. Update Lesson Status
  await db.collection('lessons').updateOne(
    { _id: new ObjectId(lessonId) },
    { $set: { status: 'completed', updatedAt: new Date() } }
  );

  // 6. Trigger Payout Calculation (The 15% Platform Fee Logic)
  if (!lesson.isTrial && lesson.price > 0) {
    const payoutResult = await queueTutorPayout(lessonId);
    if (!payoutResult.success) {
      console.error(`Payout failed for lesson ${lessonId}: ${payoutResult.reason}`);
    }
  }

  return { success: true, message: 'Lesson completed and payout queued' };
}
