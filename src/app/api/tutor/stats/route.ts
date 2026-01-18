// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { TimezoneEngine } from '../../../../lib/utils/timezoneUtil';

/**
 * GET /api/tutor/stats
 * Sophisticated aggregation for Earnings, Weekly Trends, and Lesson Counts.
 * Ported from v1 metrics/tutor-weekly and finance/tutor-summary
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

    // 1. Calculate Lifetime & Pending Earnings (v1 Finance Logic)
    // Completed = Earned; Succeeded = Already Paid; Pending = Ready for Withdrawal
    const earnings = await db.collection("lessons").aggregate([
      { $match: { tutorId: tutorId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]).toArray();
    
    const gross = earnings[0]?.total || 0;
    const netTakeHome = gross * 0.85; // Day 8: 15% Platform Fee [cite: 2026-01-10]

    // 2. Calculate Weekly Stats (v1 Weekly Metrics Logic)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyData = await db.collection("lessons").aggregate([
      { 
        $match: { 
          tutorId: tutorId, 
          startTime: { $gte: sevenDaysAgo },
          status: { $nin: ['cancelled', 'expired'] }
        } 
      },
      { $group: { _id: null, count: { $sum: 1 }, income: { $sum: "$price" } } }
    ]).toArray();

    // 3. Count Lessons by Status for Charting
    const counts = await db.collection("lessons").aggregate([
      { $match: { tutorId: tutorId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();

    return NextResponse.json({
      summary: {
        totalEarned: netTakeHome,
        pendingWithdrawal: netTakeHome, // Logic: All completed is available unless already paid
        lockedDispute: 0, // Placeholder for Phase 4 logic
      },
      weekly: {
        lessons: weeklyData[0]?.count || 0,
        income: (weeklyData[0]?.income || 0) * 0.85
      },
      chartData: counts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error("Tutor Stats Error:", error);
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}
