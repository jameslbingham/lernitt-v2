import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(req: Request) {
  try {
    const { tutorId, status } = await req.json();

    if (!tutorId || !status) {
      return NextResponse.json({ error: 'Missing tutorId or status' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("lernitt_v2");

    // Direct Database Update: No external helper files required [cite: 2026-01-10]
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(tutorId) },
      { $set: { tutorStatus: status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Tutor status updated successfully to ${status}` 
    });

  } catch (err: any) {
    console.error("Admin PATCH Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
