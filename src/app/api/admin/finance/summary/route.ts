// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { TimezoneEngine } from '../../../../lib/utils/timezoneUtil';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");
    const COMMISSION_RATE = 0.15;

    // Standardize all current calculations to Victorian Time
    const currentVictoriaTime = TimezoneEngine.formatInZone(new Date());

    const payments = await db.collection("payments").aggregate([
      { $match: { status: "succeeded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    const gmv = payments[0]?.total || 0;

    const refunds = await db.collection("refunds").aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    const totalRefunds = refunds[0]?.total || 0;

    const payouts = await db.collection("payouts").aggregate([
      { $match: { status: "succeeded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    const totalPaidOut = payouts[0]?.total || 0;

    const netGMV = Math.max(0, gmv - totalRefunds);
    const platformRevenue = netGMV * COMMISSION_RATE;
    const tutorTotalNet = netGMV - platformRevenue;

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
        revenue: platformRevenue,
        tutorNet: tutorTotalNet,
        payouts: totalPaidOut,
        liability: currentLiability
      },
      lastUpdated: currentVictoriaTime // Corrected to engine output [cite: 2026-01-10]
    });

  } catch (error) {
    console.error("Admin Finance API Error:", error);
    return NextResponse.json({ error: "Failed to compute financial summary" }, { status: 500 });
  }
}
