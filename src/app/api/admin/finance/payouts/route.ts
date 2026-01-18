// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * GET /api/admin/finance/payouts
 * Fetches the queue of pending withdrawal requests for Bob to review.
 * Ported from v1 admin payout list logic.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Security Guard: Admin only
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    /**
     * Fetch only 'pending' payouts to keep the admin queue focused.
     * We sort by 'createdAt' (oldest first) so Bob can pay people 
     * in the order they requested.
     */
    const pendingPayouts = await db.collection("payouts")
      .find({ status: 'pending' })
      .sort({ createdAt: 1 }) 
      .toArray();

    return NextResponse.json(pendingPayouts);
  } catch (error) {
    console.error("Admin Payout Queue Fetch Error:", error);
    return NextResponse.json({ error: "Failed to load payout queue" }, { status: 500 });
  }
}
