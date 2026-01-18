// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * GET /api/admin/users
 * Fetches all users for the Admin Management Table.
 * Ported from v1 admin.js user management logic
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

    // Fetch users, sorting by newest registration first
    const users = await db.collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .project({
        password: 0, // Security: Never send password hashes to the frontend
      })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin User Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch user directory" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users
 * Allows Admin to update user roles or account status (e.g., Ban/Verify).
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, updates } = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt-v2");
    const { ObjectId } = require('mongodb');

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: result.modifiedCount > 0 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
