// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';

/**
 * POST /api/admin/finance/payouts/paypal-execute
 * Allows Admin Bob to send money to a tutor's PayPal via a single click.
 *
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

    // 1. Get the payout and the tutor's profile [cite: 2026-01-12]
    const payout = await db.collection("payouts").findOne({ _id: new ObjectId(payoutId) });
    const tutor = await db.collection("users").findOne({ _id: new ObjectId(payout.tutorId) });

    if (!tutor?.paypalEmail) {
      return NextResponse.json({ error: 'Tutor has no PayPal email in profile' }, { status: 400 });
    }

    /**
     * 2. PayPal Payout Logic
     * In a live environment, this is where we call 'https://api-m.paypal.com/v1/payments/payouts'
     * For now, we simulate the success as we did in v1.
     */
    const paypalSuccess = true; // Simulated for now

    if (paypalSuccess) {
      // 3. Mark Payout as Succeeded
      await db.collection("payouts").updateOne(
        { _id: new ObjectId(payoutId) },
        { 
          $set: { 
            status: 'succeeded', 
            paidAt: new Date(),
            method: 'paypal',
            txnId: `PAY-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
          } 
        }
      );

      // 4. Deduct the tutor's balance
      await db.collection("users").updateOne(
        { _id: new ObjectId(payout.tutorId) },
        { $inc: { totalEarnings: -payout.amount } }
      );

      return NextResponse.json({ success: true, txnId: 'Simulated-PayPal-TXN' });
    }

  } catch (error) {
    console.error("PayPal Payout Error:", error);
    return NextResponse.json({ error: "PayPal execution failed" }, { status: 500 });
  }
}
