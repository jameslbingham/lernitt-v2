import { MongoClient, ObjectId } from 'mongodb';

// This is the "Master Key" we verified is working on your machine
const uri = "mongodb+srv://jameslawrencebingham:Yg2IgykoKdUa3fuJ@lernitt0.okxejmb.mongodb.net/?appName=lernitt0";

async function seed() {
  console.log("🌱 STARTING FORCED SEED...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    // Hardcoded 15% commission to match your business model
    const commissionPct = 15; 

    // 1. Create/Update a Test Tutor (Bob)
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

    // 2. Clear old test lessons to keep things clean
    await db.collection('lessons').deleteMany({ studentName: 'Alice Student (V2 Test)' });

    // 3. Create 5 Test Lessons with 15% logic
    const lessons = Array.from({ length: 5 }).map((_, i) => {
      const amount = 100; // $100 Lesson
      const commission = amount * (commissionPct / 100); // $15
      const netAmount = amount - commission; // $85
      
      return {
        tutorId: tutorId,
        studentName: 'Alice Student (V2 Test)',
        amount: amount,
        commission: commission,
        netAmount: netAmount,
        status: 'completed',
        date: new Date(Date.now() - i * 86400000)
      };
    });

    await db.collection('lessons').insertMany(lessons);
    
    console.log("------------------------------------------");
    console.log("✅ SUCCESS: 5 LESSONS SEEDED!");
    console.log(`📊 MATH CHECK: $100 Lesson -> $15 Fee -> $85 Net`);
    console.log("------------------------------------------");
    
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ SEEDING FAILED:", err.message);
    process.exit(1);
  }
}

seed();
