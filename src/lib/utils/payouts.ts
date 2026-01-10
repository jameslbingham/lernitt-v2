// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Calculates and queues a payout for a tutor after a completed lesson.
 * Implements the 85% Tutor / 15% Platform split.
 */
export async function queueTutorPayout(lessonId: string) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  // 1. Fetch the lesson and the tutor
  const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(lessonId) });
  if (!lesson || lesson.isTrial || lesson.status !== 'completed') {
    return { success: false, reason: 'Lesson not eligible for payout' };
  }

  const tutor = await db.collection('users').findOne({ _id: lesson.tutor });
  if (!tutor) return { success: false, reason: 'Tutor not found' };

  // 2. 💰 COMMISSION CALCULATION (85% to Tutor, 15% to Lernitt)
  // Logic from v1 lessons.js: Math.floor(rawAmountCents * 0.85)
  const rawAmountCents = Math.round((lesson.price || 0) * 100);
  const tutorTakeHomeCents = Math.floor(rawAmountCents * 0.85);

  if (tutorTakeHomeCents <= 0) {
    return { success: false, reason: 'No payout amount calculated' };
  }

  // 3. 🏦 Determine Provider (from v1 lessons.js)
  // If tutor has paypalEmail, use paypal; otherwise use stripe
  const provider = tutor.paypalEmail ? 'paypal' : 'stripe';

  // 4. Create the Payout record
  const payout = {
    lesson: lesson._id,
    tutor: lesson.tutor,
    amountCents: tutorTakeHomeCents,
    currency: lesson.currency || 'EUR',
    provider,
    status: 'queued',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('payouts').insertOne(payout);

  console.log(`Payout ${result.insertedId} queued for Tutor ${tutor._id} (${provider})`);
  
  return { success: true, payoutId: result.insertedId };
}
