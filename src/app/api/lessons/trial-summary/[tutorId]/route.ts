// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

/**
 * GET /api/lessons/trial-summary/[tutorId]
 * Computes trial usage per student: max 3 overall, max 1 per tutor.
 * Ported from v1 lessons.js and trials.js
 */
export async function GET(
  request: Request,
  { params }: { params: { tutorId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");
    const studentId = session.user.id;
    const { tutorId } = params;

    // Logic: Count only valid, non-cancelled trials
    const activeTrialQuery = {
      studentId: studentId,
      isTrial: true,
      status: { $nin: ['cancelled', 'canceled'] }
    };

    // 1. Total trials used across platform (Limit 3)
    const totalUsed = await db.collection("lessons").countDocuments(activeTrialQuery);

    // 2. Specific trial check for this tutor (Limit 1)
    const usedWithTutor = await db.collection("lessons").findOne({
      ...activeTrialQuery,
      tutorId: tutorId
    });

    return NextResponse.json({
      totalUsed,
      usedWithTutor: !!usedWithTutor,
      limitTotal: 3,
      limitPerTutor: 1
    });
  } catch (error) {
    console.error("Trial Summary API Error:", error);
    return NextResponse.json({ error: "Failed to fetch trial summary" }, { status: 500 });
  }
}
