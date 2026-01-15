// @ts-nocheck
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // 1. Security Check: Only Bob (the tutor) can mark his lessons complete
  if (!session || session.user.role !== 'tutor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { lessonPrice } = await request.json();
    
    // 2. Logic: Subtract 15% Platform Fee (Day 8 requirement)
    const platformFee = lessonPrice * 0.15;
    const netEarning = lessonPrice - platformFee;

    // 3. Update Bob's balance in the database
    const tutor = await User.findById(session.user.id);
    if (!tutor) throw new Error("Tutor not found");

    tutor.totalEarnings = (tutor.totalEarnings || 0) + netEarning;
    await tutor.save();

    return NextResponse.json({ 
      success: true, 
      added: netEarning, 
      newBalance: tutor.totalEarnings 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
