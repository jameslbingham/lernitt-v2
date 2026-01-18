// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/database/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * GET /api/forum/posts
 * Fetches the global community feed.
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    const posts = await db.collection("forum_posts")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

/**
 * POST /api/forum/posts
 * Alice or Bob creates a new discussion thread.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, content, category } = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    const newPost = {
      authorId: session.user.id,
      authorName: session.user.name,
      authorRole: session.user.role, // Tutors get a 'Verified' badge in UI
      title,
      content,
      category: category || "General",
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("forum_posts").insertOne(newPost);
    return NextResponse.json({ success: true, postId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
