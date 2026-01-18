// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Security Guard: Admin only
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    // COMMISSION logic ported from v1 finance.js (0.15)
    const COMMISSION_RATE = 0.15;

    // 1. Aggregate Successful Payments (Gross Merchandise Value)
    const payments = await db.collection("payments").aggregate([
      { $match: { status: "succeeded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    const gmv = payments[0]?.total || 0;

    // 2. Aggregate Approved Refunds (To be deducted from GMV)
    const refunds = await db.collection("refunds").aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    const totalRefunds = refunds[0]?.total || 0;

    // 3. Aggregate Successful Payouts (Money already left the platform)
    const payouts = await db.collection("payouts").aggregate([
      { $match: { status: "succeeded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    const totalPaidOut = payouts[0]?.total || 0;

    // 4. Calculate Net Metrics
    const netGMV = Math.max(0, gmv - totalRefunds);
    const platformRevenue = netGMV * COMMISSION_RATE;
    const tutorTotalNet = netGMV - platformRevenue;

    // 5. Aggregate Current Tutor Liability (Total of all tutor balances)
    const liabilityData = await db.collection("users").aggregate([
      { $match: { role: "tutor" } },
      { $group: { _id: null, totalBalance: { $sum: "$balance" } } }
    ]).toArray();
    const currentLiability = liabilityData[0]?.totalBalance || 0;

    return NextResponse.json({
      totals: {
        grossVolume: gmv,
        refunds: totalRefunds,
        netVolume: netGMV,
        revenue: platformRevenue, // The 15% cut
        tutorNet: tutorTotalNet,
        payouts: totalPaidOut,
        liability: currentLiability
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Admin Finance API Error:", error);
    return NextResponse.json({ error: "Failed to compute financial summary" }, { status: 500 });
  }
}
