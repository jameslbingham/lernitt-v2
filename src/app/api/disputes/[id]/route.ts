// @ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { ObjectId } from 'mongodb';

/** * FIXED PATHS FOR LERNITT-V2
 * From /api/admin/disputes/[id]/, we go:
 * 1. Up to /disputes/
 * 2. Up to /admin/
 * 3. Up to /api/
 * 4. Up to /app/
 * Then we can find the /lib/ and /api/auth folders.
 */
import clientPromise from "../../../../../lib/database/mongodb";
import { authOptions } from "../../../auth/[...nextauth]/route";

/**
 * PATCH /api/admin/disputes/[id]
 * Unified Action Route for: Resolve, Reject, Approve Refund, Deny, and Warnings.
 * Keeps your complex update logic but fixes the paths for Render.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Security Guard: Admin only access
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, resolution, note } = body;
    
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    // Prepare the update object
    const updateData: any = {
      updatedAt: new Date()
    };

    // If a status update is requested (Resolve, Reject, Warn, etc.)
    if (status) {
      updateData.status = status;
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = session.user.id;
    }

    // If a resolution text is provided
    if (resolution) {
      updateData.resolution = resolution;
    }

    // If an internal admin note is being added
    const updateOperation: any = { $set: updateData };
    
    if (note) {
      updateOperation.$push = { 
        notes: {
          by: session.user.name || "Admin",
          at: new Date(),
          text: note
        }
      };
    }

    const result = await db.collection("disputes").findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      updateOperation,
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Dispute record not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin Dispute Action API Error:", error);
    return NextResponse.json({ error: "Internal server error during dispute update" }, { status: 500 });
  }
}
