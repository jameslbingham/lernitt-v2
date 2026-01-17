// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // Using Singleton for hardware stability
import User from '@/models/User';
import { processTutorWithdrawal } from '@/lib/payoutProcessor';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // 1. Auth Guard (Kept from current v2)
  if (!session || session.user.role !== 'tutor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("lernitt");

    // 2. Fetch Tutor (Using current ID from session)
    const tutor = await db.collection("users").findOne({ _id: session.user.id });
    
    // 3. Balance Validation (Merged with v1 "Insufficient funds" check)
    // v1 logic: check if balance is >= the requested amount (using totalEarnings)
    if (!tutor || tutor.totalEarnings <= 0) {
      return NextResponse.json({ error: 'No funds available for withdrawal.' }, { status: 400 });
    }

    const amountToWithdraw = tutor.totalEarnings;
    const amountCents = Math.round(amountToWithdraw * 100); // v1 Precision Logic

    // 4. Atomic Deduction (The Safety Merge)
    // Instead of resetting to 0 after the fact, we attempt the deduction first
    const updateResult = await db.collection("users").findOneAndUpdate(
      { _id: tutor._id, totalEarnings: { $gte: amountToWithdraw } },
      { $set: { totalEarnings: 0 } },
      { returnDocument: 'after' }
    );

    if (!updateResult) {
      return NextResponse.json({ error: "Balance mismatch. Please refresh." }, { status: 400 });
    }

    // 5. Execution (Calls your existing payoutProcessor)
    // This handles the Stripe vs PayPal election you mentioned
    const payoutResult = await processTutorWithdrawal(tutor._id.toString(), amountToWithdraw);

    if (payoutResult.success) {
      // 6. Log Transaction (Ported from v1 payoutsStore)
      await db.collection("payouts").insertOne({
        tutorId: tutor._id,
        amount: amountToWithdraw,
        amountCents: amountCents,
        status: "succeeded",
        method: payoutResult.method, // "paypal" or "stripe"
        txnId: payoutResult.details?.txnId || "tx_v2_" + Date.now(),
        createdAt: new Date(),
        history: [{
          at: new Date(),
          action: "approve",
          text: `Withdrawal successful via ${payoutResult.method}`
        }]
      });

      return NextResponse.json({ 
        message: `Success! Paid via ${payoutResult.method}.`, 
        newBalance: 0 
      });
    } else {
      // 7. Rollback Logic (If the transfer fails, we put Bob's money back)
      await db.collection("users").updateOne(
        { _id: tutor._id },
        { $inc: { totalEarnings: amountToWithdraw } }
      );
      return NextResponse.json({ error: "Transfer failed at gateway. Balance restored." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("v2 Withdrawal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
