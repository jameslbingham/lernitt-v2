// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';

/**
 * POST /api/forum/comments
 * Adds a reply to a discussion thread.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { postId, content } = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    const newComment = {
      postId: new ObjectId(postId),
      authorId: session.user.id,
      authorName: session.user.name,
      authorRole: session.user.role,
      content,
      createdAt: new Date()
    };

    await db.collection("forum_comments").insertOne(newComment);

    // Atomic update to post metadata
    await db.collection("forum_posts").updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { commentCount: 1 }, $set: { updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reply" }, { status: 500 });
  }
}
