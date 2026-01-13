import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("lernitt_v2");
    
    // Professional Logic: Find all tutors to display on the marketplace
    const tutors = await db.collection('users')
      .find({ role: 'tutor' })
      .toArray();
    
    return NextResponse.json({ tutors });
  } catch (e) {
    return NextResponse.json({ tutors: [] }, { status: 500 });
  }
}
