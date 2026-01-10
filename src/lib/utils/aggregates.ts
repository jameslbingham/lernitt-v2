// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Recalculates a tutor's average rating and total review count.
 * This ensures the "Score" on their profile is always accurate.
 */
export async function updateTutorRating(tutorId: string) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  // 1. Use MongoDB aggregation to find the average
  const stats = await db.collection('reviews').aggregate([
    { $match: { tutor: new ObjectId(tutorId) } },
    {
      $group: {
        _id: '$tutor',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]).toArray();

  if (stats.length === 0) return { success: false, reason: 'No reviews found' };

  const { averageRating, reviewCount } = stats[0];

  // 2. Update the User profile with the new aggregate data
  await db.collection('users').updateOne(
    { _id: new ObjectId(tutorId) },
    { 
      $set: { 
        averageRating: parseFloat(averageRating.toFixed(1)), // e.g., 4.7
        reviewCount: reviewCount,
        updatedAt: new Date()
      } 
    }
  );

  return { success: true, averageRating, reviewCount };
}
