// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/database/mongodb';
import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { tutorId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const dur = parseInt(searchParams.get('dur') || '60');
    const from = searchParams.get('from'); // YYYY-MM-DD
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    const avail = await db.collection("availability").findOne({ tutor: new ObjectId(params.tutorId) });
    if (!avail) return NextResponse.json([]);

    const tutorTz = avail.timezone || "UTC";
    const startDate = DateTime.fromISO(from).setZone(tutorTz).startOf('day');
    
    // Logic: Slice day into slots
    const dow = startDate.weekday === 7 ? 0 : startDate.weekday;
    const weeklyRule = (avail.weekly || []).find(w => w.dow === dow);
    if (!weeklyRule) return NextResponse.json([]);

    // We generate slots for the requested day
    const slots = [];
    for (const range of weeklyRule.ranges) {
      let cur = startDate.set({ hour: parseInt(range.start.slice(0, 2)), minute: parseInt(range.start.slice(3)) });
      const end = startDate.set({ hour: parseInt(range.end.slice(0, 2)), minute: parseInt(range.end.slice(3)) });
      
      while (cur.plus({ minutes: dur }) <= end) {
        slots.push(cur.toUTC().toISO());
        cur = cur.plus({ minutes: 30 }); // Policy: 30-min increments
      }
    }

    return NextResponse.json(slots);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load slots" }, { status: 500 });
  }
}
