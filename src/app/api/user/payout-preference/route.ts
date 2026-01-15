// @ts-nocheck
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { withdrawalMethod, paypalEmail } = await request.json();

  await dbConnect();

  try {
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        withdrawalMethod, 
        paypalEmail: withdrawalMethod === 'PayPal' ? paypalEmail : undefined 
      },
      { new: true }
    );

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
