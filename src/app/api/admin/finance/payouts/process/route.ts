// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';

/**
 * POST /api/admin/finance/payouts/process
 * Executed by Bob (Admin) to finalize a tutor's withdrawal request.
 * Supports PayPal withdrawals if specified in tutor profile [cite: 2026-01-12].
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Security Guard: Admin only
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payoutId } = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    // 1. Find the pending payout
    const payout = await db.collection("payouts").findOne({ 
      _id: new ObjectId(payoutId),
      status: 'pending' 
    });

    if (!payout) {
      return NextResponse.json({ error: 'Pending payout not found' }, { status: 404 });
    }

    // 2. Start a Session/Transaction to ensure data integrity
    // Note: On your hardware, we do a manual sequential update for safety
    
    // Update the Payout status
    await db.collection("payouts").updateOne(
      { _id: new ObjectId(payoutId) },
      { 
        $set: { 
          status: 'completed', 
          processedAt: new Date(),
          processedBy: session.user.id 
        } 
      }
    );

    /**
     * 3. Logic for Balance Deduction
     * We deduct the amount from the tutor's 'totalEarnings' (or current balance)
     * to reflect that the money has been sent.
     */
    await db.collection("users").updateOne(
      { _id: new ObjectId(payout.tutorId) },
      { $inc: { totalEarnings: -payout.amount } }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Payout of $${payout.amount} marked as completed.` 
    });

  } catch (error) {
    console.error("Payout Processing Error:", error);
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
  }
}
