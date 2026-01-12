import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("lernitt_v2");
    
    // Only show approved tutors in the marketplace
    const tutors = await db.collection('users')
      .find({ 
        role: 'tutor', 
        tutorStatus: 'approved' 
      })
      .toArray();
    
    return NextResponse.json({ tutors });
  } catch (e) {
    return NextResponse.json({ tutors: [] }, { status: 500 });
  }
}
