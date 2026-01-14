// src/app/api/tutors/availability/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get('tutorId');
    
    if (!tutorId) return NextResponse.json({ error: "Tutor ID required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("lernitt_v2");
    
    // Fetch all availability records for this tutor (both recurring and overrides)
    const availability = await db.collection("advancedavailabilities")
      .find({ tutor: new ObjectId(tutorId), active: true })
      .toArray();

    return NextResponse.json(availability);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load availability" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tutorId, type, dayOfWeek, specificDate, slots } = body;

    const client = await clientPromise;
    const db = client.db("lernitt_v2");

    // italki logic: If we save a recurring day, update that specific day's template.
    // If we save an override, it only affects that specific date.
    const filter = type === 'recurring' 
      ? { tutor: new ObjectId(tutorId), type: 'recurring', dayOfWeek }
      : { tutor: new ObjectId(tutorId), type: 'override', specificDate: new Date(specificDate) };

    const update = {
      $set: {
        tutor: new ObjectId(tutorId),
        type,
        dayOfWeek: type === 'recurring' ? dayOfWeek : null,
        specificDate: type === 'override' ? new Date(specificDate) : null,
        slots,
        active: true,
        updatedAt: new Date()
      }
    };

    await db.collection("advancedavailabilities").updateOne(filter, update, { upsert: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save availability" }, { status: 500 });
  }
}
