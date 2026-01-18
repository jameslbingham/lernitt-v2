// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';

/**
 * GET /api/tutor/stats
 * Aggregates high-level earnings and lesson stats for the Tutor Dashboard.
 *
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'tutor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");
    const tutorId = session.user.id;

    // 1. Calculate Lifetime Earnings (Completed & Succeeded Lessons)
    const earningsData = await db.collection("lessons").aggregate([
      { $match: { tutorId: tutorId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]).toArray();
    
    // Applying the 15% platform fee logic from Day 8
    const grossEarnings = earningsData[0]?.total || 0;
    const netEarnings = grossEarnings * 0.85; 

    // 2. Calculate "Locked" funds (Lessons currently in dispute)
    const disputeData = await db.collection("lessons").aggregate([
      { $match: { tutorId: tutorId, status: "disputed" } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]).toArray();
    const lockedFunds = (disputeData[0]?.total || 0) * 0.85;

    // 3. Count Lessons by Status
    const stats = await db.collection("lessons").aggregate([
      { $match: { tutorId: tutorId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();

    return NextResponse.json({
      earnings: {
        lifetimeNet: netEarnings,
        lockedInDispute: lockedFunds,
      },
      lessonCounts: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error("Tutor Stats API Error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
