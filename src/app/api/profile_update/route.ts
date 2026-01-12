import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt_v2");

    // This updates Bob's rates, bio, and his PayPal preference
    await db.collection('users').updateOne(
      { email: 'bob_tutor@example.com' },
      { 
        $set: { 
          name: body.name,
          hourlyRate: body.hourlyRate,
          subjects: body.subjects,
          bio: body.bio,
          payoutMethod: body.payoutMethod, // 'stripe' or 'paypal'
          paypalEmail: body.paypalEmail,   // Saved for withdrawals
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
