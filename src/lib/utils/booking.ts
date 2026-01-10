// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { CurrencyEngine } from './currency';

/**
 * Merged Booking Manager: 
 * Protects business rules (trials/clashes) and enforces USD as master currency.
 */
export async function createLessonBooking(data: {
  tutorId: string;
  studentId: string;
  subjectId: string; // Updated to use ID for 3-layer hierarchy
  startTime: string;
  endTime: string;
  price: number;
  currency: string;
  isTrial: boolean;
}) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  // 1. Guard: Only Approved Tutors
  const tutor = await db.collection('users').findOne({ _id: new ObjectId(data.tutorId) });
  if (!tutor || tutor.tutorStatus !== 'approved') {
    return { success: false, reason: 'Tutor is not approved for bookings' };
  }

  // 2. Trial Logic: Max 3 total, 1 per tutor
  if (data.isTrial) {
    const durMin = Math.round((new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / 60000);
    if (durMin !== 30) return { success: false, reason: 'Trials must be exactly 30 minutes' };

    const alreadyHadTrialWithTutor = await db.collection('lessons').findOne({
      student: new ObjectId(data.studentId),
      tutor: new ObjectId(data.tutorId),
      isTrial: true
    });
    if (alreadyHadTrialWithTutor) return { success: false, reason: 'Trial already used with this tutor' };

    const totalTrials = await db.collection('lessons').countDocuments({
      student: new ObjectId(data.studentId),
      isTrial: true
    });
    if (totalTrials >= 3) return { success: false, reason: 'Maximum of 3 free trials reached' };
  }

  // 3. Clash Guard: Check if tutor is busy
  const clash = await db.collection('lessons').findOne({
    tutor: new ObjectId(data.tutorId),
    status: { $nin: ['cancelled', 'expired'] },
    startTime: { $lt: new Date(data.endTime) },
    endTime: { $gt: new Date(data.startTime) }
  });
  if (clash) return { success: false, reason: 'Tutor already has a lesson at this time' };

  // 4. Currency Normalization: Convert to USD for Database Storage
  let finalPriceUSD = data.isTrial ? 0 : data.price;
  
  if (!data.isTrial && data.currency !== 'USD') {
    // If student paid in EUR/GBP, convert to USD base using our Engine
    finalPriceUSD = await CurrencyEngine.convert(data.price, 'USD');
  }

  // 5. Create the Lesson
  const newLesson = {
    tutor: new ObjectId(data.tutorId),
    student: new ObjectId(data.studentId),
    subjectId: new ObjectId(data.subjectId), // Linked to 3-layer categories
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    price: finalPriceUSD, 
    currency: 'USD', // Hardcoded platform base
    status: 'booked',
    isPaid: data.isTrial ? true : false,
    isTrial: data.isTrial,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection('lessons').insertOne(newLesson);
  return { success: true, lessonId: result.insertedId };
}
