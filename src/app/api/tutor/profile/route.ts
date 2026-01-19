// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';

/**
 * GET /api/tutor/profile
 * Fetches the tutor's own professional data.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'tutor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) });
    
    // Safety: don't return password
    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}

/**
 * PATCH /api/tutor/profile
 * Allows a tutor to submit their professional profile for verification.
 * Ported from v1 TutorProfileSetup and video logic.
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'tutor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    // Fields ported from v1 User model and Profile Setup
    const updateDoc = {
      displayName: data.displayName,
      headline: data.headline,
      bio: data.bio,
      languages: data.languages, // Array of strings
      hourlyRate: Number(data.hourlyRate),
      avatarUrl: data.avatarUrl,
      
      /**
       * Sophisticated Video Logic
       * Introduction Video URL is stored here for Admin Bob's manual review.
       * Successful verification triggers 'approved' status later.
       */
      videoUrl: data.videoUrl, 
      
      // Auto-set status to pending upon submission
      tutorStatus: 'pending',
      updatedAt: new Date()
    };

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Profile submitted for review. Public listing is hidden until approved." 
    });
  } catch (error) {
    console.error("Tutor Onboarding API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
