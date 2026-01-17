import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { tutorEmail, amount } = await req.json();
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    // Math: $25 lesson * 85% = $21.25 for Bob
    const earnings = amount * 0.85;

    await db.collection("users").updateOne(
      { email: tutorEmail },
      { $inc: { balance: earnings } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
