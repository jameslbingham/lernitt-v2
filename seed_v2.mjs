import { MongoClient, ObjectId } from 'mongodb';

// Master Key for your MongoDB instance
const uri = "mongodb+srv://jameslawrencebingham:Yg2IgykoKdUa3fuJ@lernitt0.okxejmb.mongodb.net/?appName=lernitt0";

async function seed() {
  console.log("🌱 STARTING COMPLETE V2 PROTOCOL SEED...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("lernitt_v2");
    
    const commissionPct = 15; // Your 15% platform fee

    const tutorId = new ObjectId();
    await db.collection('users').updateOne(
      { email: 'bob_tutor@example.com' },
      { $set: { 
          name: 'Bob Tutor', 
          role: 'tutor', 
          currency: 'USD',
          baseRate: 100 
        } 
      },
      { upsert: true }
    );

    // Clear old test data
    await db.collection('lessons').deleteMany({ studentName: 'Alice Student (V2 Test)' });

    // Create 5 Lessons with Video Links and Recording Protocols
    const lessons = Array.from({ length: 5 }).map((_, i) => {
      const amount = 100;
      const commission = amount * (commissionPct / 100);
      const netAmount = amount - commission;
      
      return {
        tutorId: tutorId,
        studentName: 'Alice Student (V2 Test)',
        subject: 'English Lesson',
        amount: amount,
        commission: commission,
        netAmount: netAmount,
        status: 'completed',
        date: new Date(Date.now() - i * 86400000),
        videoLink: "https://lernitt.daily.co/demo-room", // Your Daily.co room
        // V2 Recording Protocol Fields
        recordingEnabled: true,
        recordingStatus: i === 0 ? 'processing' : 'stored',
        expiryDate: new Date(Date.now() + (30 - i) * 86400000) // 30-day auto-delete logic
      };
    });

    await db.collection('lessons').insertMany(lessons);
    
    console.log("------------------------------------------");
    console.log("✅ SUCCESS: 5 LESSONS SEEDED WITH RECORDING PROTOCOLS!");
    console.log("------------------------------------------");
    
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ SEEDING FAILED:", err.message);
    process.exit(1);
  }
}

seed();
