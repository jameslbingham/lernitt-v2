// @ts-nocheck
import clientPromise from '../lib/database/mongodb';
import { ObjectId } from 'mongodb';

/**
 * World-Class Finance Seeder:
 * Ported from v1 to populate the v2 USD-base ecosystem.
 * Normalizes all currency to USD.
 */
async function seedFinance() {
  const client = await clientPromise;
  const db = client.db();

  console.log("✅ Connected to MongoDB. Starting USD Finance Seed...");

  // 1. Clear existing test data to prevent duplicates
  await db.collection('users').deleteMany({ email: /@example.com$/ });
  await db.collection('lessons').deleteMany({});
  await db.collection('payments').deleteMany({});
  await db.collection('payouts').deleteMany({});

  // 2. Create Tutor and Student
  const tutorId = new ObjectId();
  const studentId = new ObjectId();

  await db.collection('users').insertMany([
    {
      _id: tutorId,
      name: "Bob Tutor (USD)",
      email: "bob.tutor@example.com",
      role: "tutor",
      tutorStatus: "approved",
      hourlyRate: 25, // Stored in USD
      totalEarnings: 0,
      createdAt: new Date()
    },
    {
      _id: studentId,
      name: "Alice Student",
      email: "alice.student@example.com",
      role: "student",
      createdAt: new Date()
    }
  ]);

  // 3. Create Lessons, Payments, and Payouts
  for (let i = 0; i < 5; i++) {
    const lessonId = new ObjectId();
    const basePrice = 20 + (i * 5); // $20, $25, $30, etc.
    const tutorShare = basePrice * 0.85; // 85% Split

    // Create Lesson
    await db.collection('lessons').insertOne({
      _id: lessonId,
      tutor: tutorId,
      student: studentId,
      startTime: new Date(Date.now() - i * 86400000),
      endTime: new Date(Date.now() - i * 86400000 + 3600000),
      price: basePrice,
      currency: "USD", // Normalized
      status: "completed",
      isPaid: true,
      createdAt: new Date()
    });

    // Create Payment (Student Inflow)
    await db.collection('payments').insertOne({
      user: studentId,
      lesson: lessonId,
      provider: "stripe",
      amount: basePrice,
      currency: "USD",
      status: "succeeded",
      createdAt: new Date()
    });

    // Create Payout (Tutor Outflow)
    await db.collection('payouts').insertOne({
      lesson: lessonId,
      tutor: tutorId,
      amount: tutorShare,
      amountCents: Math.round(tutorShare * 100), // Precision from v1
      currency: "USD",
      provider: "stripe",
      status: i === 0 ? "queued" : "succeeded",
      createdAt: new Date()
    });
  }

  console.log("✅ Seed Complete: 1 Tutor, 1 Student, 5 Lessons (All USD).");
  process.exit(0);
}

seedFinance().catch(err => {
  console.error("❌ Seed Failed:", err);
  process.exit(1);
});
