// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';

/**
 * PATCH /api/tutor/profile/payout
 * Allows Tutor Bob to set his PayPal email and preferred method.
 * [cite: 2026-01-12]
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  // Security Guard: Only authenticated Tutors can update payout settings
  if (!session || session.user.role !== 'tutor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paypalEmail, payoutMethod } = await request.json();

    // Basic validation for email format
    if (payoutMethod === 'paypal' && (!paypalEmail || !paypalEmail.includes('@'))) {
      return NextResponse.json({ error: 'Valid PayPal email is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    // Update the tutor document with their payment election [cite: 2026-01-12]
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $set: { 
          paypalEmail: paypalEmail || "", 
          payoutMethod: payoutMethod || "stripe", // default to stripe as per v1 logic
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Payout profile updated" });
  } catch (error) {
    console.error("Tutor Profile Payout Update Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
