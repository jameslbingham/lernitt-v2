import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("lernitt_v2");
    
    // Systemic Solution: Fetch tutors waiting for approval [cite: 2026-01-13]
    const pendingTutors = await db.collection('users')
      .find({ role: 'tutor', tutorStatus: 'pending' })
      .toArray();
    
    return NextResponse.json({ tutors: pendingTutors });
  } catch (e) {
    return NextResponse.json({ tutors: [] }, { status: 500 });
  }
}
