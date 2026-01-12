import { NextResponse } from 'next/server';
// Fixed Line 2: Using relative path to eliminate the red squiggle error
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    // Standardized on 'lernitt_v2' to match your successful seed
    const db = client.db("lernitt_v2");
    
    const lessons = await db.collection("lessons")
      .find({})
      .sort({ date: -1 })
      .limit(10)
      .toArray();
    
    return NextResponse.json({ lessons });
  } catch (e) {
    console.error("Dashboard API Error:", e);
    return NextResponse.json({ lessons: [] }, { status: 500 });
  }
}
