// @ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { ObjectId } from 'mongodb';

/** * GPS PATH FIX:
 * We use the '@' symbol to point directly to your project folders.
 * This tells Render exactly where to find your database and auth logic.
 */
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/database/mongodb";

/**
 * PATCH /api/admin/[id]
 * Merged version: Keeps your dispute logic but fixes the paths for Render.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Security Guard: Admin only
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status, resolution } = await request.json();
    
    // Validation: Match v1 rules
    if (!['resolved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    const result = await db.collection("disputes").findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status, 
          resolution: resolution || "",
          resolvedAt: new Date(),
          resolvedBy: session.user.id
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin Dispute PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update dispute" }, { status: 500 });
  }
}
