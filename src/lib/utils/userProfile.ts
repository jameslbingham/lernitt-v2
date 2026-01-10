// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Fetches a public profile for a user.
 * Excludes sensitive fields like passwords and private keys.
 */
export async function getPublicProfile(userId: string) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const user = await db.collection('users').findOne(
    { _id: new ObjectId(userId) },
    {
      projection: {
        password: 0,
        stripeAccountId: 0,
        paypalEmail: 0,
        isAdmin: 0,
      }
    }
  );

  if (!user) return { success: false, reason: 'User not found' };

  return { success: true, profile: user };
}
