// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Merged Payout Manager:
 * Calculates the 85% Tutor / 15% Platform split using USD as the base.
 * Automatically selects provider based on tutor profile (PayPal or Stripe).
 */
export async function queueTutorPayout(lessonId: string) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  // 1. Fetch the lesson and ensure it's eligible for payout
  const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(lessonId) });
  
  // Trials are free (€0/$0) and only completed lessons can trigger payouts
  if (!lesson || lesson.isTrial || lesson.status !== 'completed') {
    return { success: false, reason: 'Lesson not eligible for payout' };
  }

  const tutor = await db.collection('users').findOne({ _id: lesson.tutor });
  if (!tutor) return { success: false, reason: 'Tutor not found' };

  // 2. 💰 COMMISSION CALCULATION (85% to Tutor, 15% to Lernitt)
  // We work in Cents to avoid floating point math errors
  // The 'lesson.price' is now stored as USD
  const rawAmountCents = Math.round((lesson.price || 0) * 100);
  const tutorTakeHomeCents = Math.floor(rawAmountCents * 0.85);

  if (tutorTakeHomeCents <= 0) {
    return { success: false, reason: 'No payout amount calculated' };
  }

  // 3. 🏦 Determine Provider
  // Priority to PayPal if email exists, otherwise default to Stripe Connect
  const provider = tutor.paypalEmail ? 'paypal' : 'stripe';

  // 4. Create the Payout record
  const payout = {
    lesson: lesson._id,
    tutor: lesson.tutor,
    amountCents: tutorTakeHomeCents,
    currency: 'USD', // Force USD as the payout base
    provider,
    status: 'queued',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('payouts').insertOne(payout);

  console.log(`Payout ${result.insertedId} queued in USD for Tutor ${tutor._id} (${provider})`);
  
  return { success: true, payoutId: result.insertedId };
}
