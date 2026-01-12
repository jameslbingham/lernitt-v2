import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt_v2");

    // We replace the old code with this multi-field engine to support italki features
    await db.collection('users').updateOne(
      { email: 'bob_tutor@example.com' },
      { 
        $set: { 
          name: body.name,
          // italki Feature: Professional vs. Community
          tutorType: body.tutorType || 'community', 
          // V1 Status: Merged from your User model
          tutorStatus: body.tutorStatus || 'approved',
          // Video Support: Student choice factor
          videoUrl: body.videoUrl,   
          bio: body.bio,
          // Tiered Pricing: Array of subjects with rates & discounts
          subjects: body.subjects,   
          // V1 Compatibility: Sync the primary rate for search algorithms
          hourlyRate: body.subjects[0]?.rate || 100, 
          // Payout Flexibility: Choice between Stripe and PayPal
          payoutMethod: body.payoutMethod,
          paypalEmail: body.paypalEmail,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Profile Update Error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
