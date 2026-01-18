// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';
import { TimezoneEngine } from '../../../../../../lib/utils/timezoneUtil';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payoutId } = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    const payout = await db.collection("payouts").findOne({ 
      _id: new ObjectId(payoutId),
      status: 'pending' 
    });

    if (!payout) {
      return NextResponse.json({ error: 'Pending payout not found' }, { status: 404 });
    }

    // Force date to UTC standard via Engine [cite: 2026-01-10]
    const processedAtUTC = TimezoneEngine.toUTC(new Date().toISOString(), undefined, 'UTC');

    await db.collection("payouts").updateOne(
      { _id: new ObjectId(payoutId) },
      { 
        $set: { 
          status: 'completed', 
          processedAt: processedAtUTC,
          processedBy: session.user.id 
        } 
      }
    );

    await db.collection("users").updateOne(
      { _id: new ObjectId(payout.tutorId) },
      { $inc: { totalEarnings: -payout.amount } }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Payout processed at ${TimezoneEngine.formatInZone(processedAtUTC)}` 
    });

  } catch (error) {
    console.error("Payout Processing Error:", error);
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
  }
}
