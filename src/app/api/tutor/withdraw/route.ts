// @ts-nocheck
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { processTutorWithdrawal } from '@/lib/payoutProcessor';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'tutor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  try {
    const tutor = await User.findById(session.user.id);
    if (!tutor || tutor.totalEarnings <= 0) {
      return NextResponse.json({ error: 'No funds available.' }, { status: 400 });
    }
    const payoutResult = await processTutorWithdrawal(tutor._id.toString(), tutor.totalEarnings);
    if (payoutResult.success) {
      tutor.totalEarnings = 0;
      await tutor.save();
      return NextResponse.json({ 
        message: `Successfully initiated ${payoutResult.method} transfer.`,
        details: payoutResult 
      });
    }
    throw new Error("Payout processor failed.");
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
