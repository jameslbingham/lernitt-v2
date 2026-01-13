import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt_v2");

    // SYSTEMIC SOLUTION: Automatically creates or updates the tutor record
    await db.collection('users').updateOne(
      { email: 'bob_tutor@example.com' }, 
      { 
        $set: { 
          name: body.name,
          tutorType: body.tutorType || 'community', 
          videoUrl: body.videoUrl, 
          bio: body.bio,
          subjects: body.subjects, 
          hourlyRate: body.subjects?.[0]?.rate || 0,
          payoutMethod: body.payoutMethod,
          paypalEmail: body.paypalEmail,
          // Automates the approval lifecycle
          tutorStatus: 'pending', 
          role: 'tutor',
          isTutor: true,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Profile submitted for approval." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
