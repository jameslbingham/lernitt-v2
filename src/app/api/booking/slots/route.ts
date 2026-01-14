// src/app/api/booking/slots/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';
import { TimeZoneEngine } from '../../../../lib/utils/timezone';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get('tutorId');
    const date = searchParams.get('date'); // YYYY-MM-DD
    const duration = parseInt(searchParams.get('dur') || '60');
    const studentTz = searchParams.get('tz') || 'UTC';

    if (!tutorId || !date) {
      return NextResponse.json({ error: "Missing tutorId or date" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("lernitt_v2");

    // 1. Get Tutor Availability Settings
    const avail = await db.collection("advancedavailabilities").findOne({ 
      tutor: new ObjectId(tutorId),
      active: true 
    });

    if (!avail) return NextResponse.json([]);

    const tutorTz = avail.timezone || "UTC";
    const interval = Number(avail.slotInterval) || 30;

    // 2. Determine ranges for this specific day
    const day = DateTime.fromISO(date, { zone: tutorTz }).startOf('day');
    const dowIndex = day.weekday === 7 ? 0 : day.weekday; // Convert Luxon to DB dow
    
    // Check for overrides first, then weekly recurring
    const override = avail.exceptions?.find((e: any) => e.date === date);
    let ranges = override ? (override.open ? override.ranges : []) : 
                 avail.weekly?.find((w: any) => w.dow === dowIndex)?.ranges || [];

    if (!ranges.length) return NextResponse.json([]);

    // 3. Generate raw potential slots using our TimeZoneEngine logic
    const rawSlots = TimeZoneEngine.generateBookableSlots(day, ranges, duration, interval);

    // 4. Fetch existing lessons to block out occupied time
    const dayEnd = day.endOf('day').toUTC().toJSDate();
    const dayStart = day.toUTC().toJSDate();

    const lessons = await db.collection("lessons").find({
      tutorId: new ObjectId(tutorId),
      startTime: { $lt: dayEnd },
      endTime: { $gt: dayStart },
      status: { $ne: "cancelled" }
    }).toArray();

    // 5. Filter out overlaps (V1 Migration logic)
    const availableSlots = rawSlots.filter(slotISO => {
      const slotS = DateTime.fromISO(slotISO).toUTC();
      const slotE = slotS.plus({ minutes: duration });

      return !lessons.some(lesson => {
        const lessonS = DateTime.fromJSDate(lesson.startTime).toUTC();
        const lessonE = DateTime.fromJSDate(lesson.endTime).toUTC();
        return (slotS < lessonE && slotE > lessonS);
      });
    });

    // 6. Return slots translated to Student's Local Time
    const translatedSlots = availableSlots.map(iso => 
      DateTime.fromISO(iso).setZone(studentTz).toISO()
    );

    return NextResponse.json(translatedSlots);

  } catch (error) {
    console.error("Slot Generation Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
