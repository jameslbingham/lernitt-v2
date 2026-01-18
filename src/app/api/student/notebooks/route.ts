// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';

/**
 * GET /api/student/notebooks
 * Fetches all notebook entries for the logged-in student.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    const notes = await db.collection("notebooks")
      .find({ studentId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notebooks" }, { status: 500 });
  }
}

/**
 * POST /api/student/notebooks
 * Alice creates or updates a note for a specific lesson.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { lessonId, title, content, tutorName } = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    const newNote = {
      studentId: session.user.id,
      lessonId: lessonId ? new ObjectId(lessonId) : null,
      tutorName: tutorName || "General Note",
      title: title || "New Lesson Note",
      content: content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("notebooks").insertOne(newNote);
    return NextResponse.json({ success: true, noteId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
