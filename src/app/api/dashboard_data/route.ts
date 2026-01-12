import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    // Connecting to your synchronized 'lernitt_v2' database
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
