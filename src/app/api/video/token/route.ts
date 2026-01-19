// @ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from '../../../../lib/database/mongodb';
import { ObjectId } from 'mongodb';

const DAILY_API_KEY = process.env.DAILY_API_KEY;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { lessonId } = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    const lesson = await db.collection("lessons").findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    // Security: Only allow join if lesson is PAID or CONFIRMED
    const validStatuses = ["paid", "confirmed", "completed"];
    if (!validStatuses.includes(lesson.status)) {
      return NextResponse.json({ error: 'Lesson not ready for entry' }, { status: 403 });
    }

    const isTutor = session.user.id === lesson.tutorId;
    const isStudent = session.user.id === lesson.studentId;
    if (!isTutor && !isStudent) return NextResponse.json({ error: 'Not authorized for this lesson' }, { status: 403 });

    const roomName = `lesson-${lessonId}`;

    // 1. Ensure the Daily.co room exists
    await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${DAILY_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        name: roomName, 
        properties: { 
          enable_chat: true,
          enable_screenshare: true,
          eject_after_elapsed_seconds: 7200 
        } 
      })
    });

    // 2. Generate a secure Meeting Token
    const tokenRes = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${DAILY_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: isTutor,
          user_name: isTutor ? "Tutor" : "Student"
        }
      })
    });
    
    const tokenData = await tokenRes.json();

    return NextResponse.json({ 
      roomUrl: `https://lernitt.daily.co/${roomName}`, 
      token: tokenData.token 
    });
  } catch (error) {
    console.error("Video Bridge Error:", error);
    return NextResponse.json({ error: "Failed to generate meeting credentials" }, { status: 500 });
  }
}
