import { NextResponse } from 'next/server';
import clientPromise from '@/lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
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

    // Ported v1 Filtering Logic (filterMockList)
    let query: any = { tutorId: session.user.id };

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

    // Sort by newest first (as seen in v1 PayoutsTab sort logic)
    const transactions = await db.collection("payouts")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}
