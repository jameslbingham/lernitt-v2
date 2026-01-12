import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("lernitt_v2");
    
    // Always load Bob's specific profile for this V2 demo
    const user = await db.collection('users').findOne({ email: 'bob_tutor@example.com' });
    
    return NextResponse.json(user || {});
  } catch (e) {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
