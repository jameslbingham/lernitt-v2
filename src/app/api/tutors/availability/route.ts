// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Handles saving and updating italki-style availability.
 * Supports both recurring templates and specific date overrides.
 */
export async function POST(req: Request) {
  try {
    const { tutorId, type, dayOfWeek, specificDate, slots } = await req.json();

    if (!tutorId || !type || !slots) {
      return NextResponse.json({ error: 'Missing required availability data' }, { status: 400 });
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();

    // 1. Prepare the document
    const updateData = {
      tutor: new ObjectId(tutorId),
      type, // 'recurring' or 'override'
      slots: slots.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        subjects: s.subjects.map(id => new ObjectId(id)),
        isTrialAvailable: s.isTrialAvailable ?? true
      })),
      active: true,
      updatedAt: new Date()
    };

    // 2. Logic for Overrides vs. Recurring
    let filter = { tutor: new ObjectId(tutorId), type };
    if (type === 'override') {
      filter.specificDate = new Date(specificDate);
      updateData.specificDate = new Date(specificDate);
    } else {
      filter.dayOfWeek = dayOfWeek;
      updateData.dayOfWeek = dayOfWeek;
    }

    // 3. Upsert: Update if exists, otherwise create new
    const result = await db.collection('advancedavailabilities').updateOne(
      filter,
      { $set: updateData },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Availability ${type} saved successfully`,
      result 
    });

  } catch (err) {
    console.error('Availability API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Fetches the tutor's current settings for the dashboard.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get('tutorId');

    if (!tutorId) {
      return NextResponse.json({ error: 'Missing tutorId' }, { status: 400 });
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();

    const config = await db.collection('advancedavailabilities')
      .find({ tutor: new ObjectId(tutorId), active: true })
      .toArray();

    return NextResponse.json(config);
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
