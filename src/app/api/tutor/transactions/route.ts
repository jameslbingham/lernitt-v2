// @ts-nocheck
import { NextResponse } from 'next/server';
// Fixed relative path to your database singleton
import clientPromise from '../../../../lib/database/mongodb'; 
import { getServerSession } from "next-auth/next";
// Fixed relative path to your auth configuration
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Security Guard: Ensure only authenticated tutors access their own data
  if (!session || session.user.role !== 'tutor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    // Unified query: Specific to the logged-in tutor
    let query: any = { tutorId: session.user.id };

    // Ported v1 Filtering Logic
    if (status) query.status = status;
    
    if (q) {
      query.$or = [
        { txnId: { $regex: q, $options: 'i' } },
        { method: { $regex: q, $options: 'i' } },
        { recipientEmail: { $regex: q, $options: 'i' } }
      ];
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Database Fetch: Pulling from the v2 'payouts' collection
    const transactions = await db.collection("payouts")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Ledger API Error:", error);
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}
