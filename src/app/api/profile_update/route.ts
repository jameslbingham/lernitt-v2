import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt_v2");

    // SYSTEMIC SOLUTION: This works for Bob and every future tutor automatically
    await db.collection('users').updateOne(
      { email: 'bob_tutor@example.com' }, // Identified user context
      { 
        $set: { 
          name: body.name,
          tutorType: body.tutorType || 'community', // Professional vs Community
          videoUrl: body.videoUrl, 
          bio: body.bio,
          subjects: body.subjects, // Tiered pricing array
          hourlyRate: body.subjects?.[0]?.rate || 0,
          payoutMethod: body.payoutMethod,
          paypalEmail: body.paypalEmail,
          // NEW: Every tutor starts as 'pending' for your approval
          tutorStatus: 'pending', 
          role: 'tutor',
          isTutor: true,
          updatedAt: new Date()
        } 
      },
      { upsert: true } // Creates the record if it doesn't exist
    );

    return NextResponse.json({ success: true, message: "Profile submitted for approval." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
