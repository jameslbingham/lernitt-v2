// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { validateSlotForBooking } from '../../../lib/utils/bookingHelper';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = await clientPromise;
  const db = client.db("lernitt-v2");

  try {
    const body = await request.json();
    const { tutor, startTime, endTime, price, isTrial, notes } = body;

    // 1. Sophisticated Trial Guard
    if (isTrial) {
      const usedWithTutor = await db.collection("lessons").findOne({ 
        studentId: session.user.id, 
        tutorId: tutor, 
        isTrial: true, 
        status: { $nin: ['cancelled'] } 
      });
      if (usedWithTutor) return NextResponse.json({ error: "Trial already used with this tutor" }, { status: 400 });

      const totalTrials = await db.collection("lessons").countDocuments({ 
        studentId: session.user.id, 
        isTrial: true, 
        status: { $nin: ['cancelled'] } 
      });
      if (totalTrials >= 3) return NextResponse.json({ error: "Free trial limit (3) reached" }, { status: 400 });
    }

    // 2. Validate Slot Availability & Clash Guard
    const durMins = Math.round((new Date(endTime) - new Date(startTime)) / 60000);
    const chk = await validateSlotForBooking(db, { tutorId: tutor, startISO: startTime, endISO: endTime, durMins });
    if (!chk.ok) return NextResponse.json({ error: chk.reason }, { status: 400 });

    // 3. Atomic Lesson Creation
    const newLesson = {
      tutorId: tutor,
      studentId: session.user.id,
      studentName: session.user.name,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      price: isTrial ? 0 : price,
      isTrial: !!isTrial,
      status: 'booked',
      notes: notes || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("lessons").insertOne(newLesson);
    return NextResponse.json({ success: true, _id: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error("Booking Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
