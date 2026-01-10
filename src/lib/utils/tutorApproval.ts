// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Updates a tutor's approval status.
 * This directly impacts their ability to be booked for lessons.
 */
export async function updateTutorStatus(
  tutorId: string, 
  newStatus: 'none' | 'pending' | 'approved' | 'rejected'
) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  // 1. Verify the user exists and is a tutor
  const user = await db.collection('users').findOne({ _id: new ObjectId(tutorId) });
  
  if (!user) {
    return { success: false, reason: 'User not found' };
  }

  if (user.role !== 'tutor' && !user.isTutor) {
    return { success: false, reason: 'User is not designated as a tutor' };
  }

  // 2. Perform the update
  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(tutorId) },
    { 
      $set: { 
        tutorStatus: newStatus,
        updatedAt: new Date()
      } 
    }
  );

  if (result.modifiedCount === 0) {
    return { success: false, reason: 'Status was already set to ' + newStatus };
  }

  console.log(`Tutor ${tutorId} status updated to: ${newStatus}`);

  return { success: true, status: newStatus };
}
