// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/database/mongodb';
import { supabase } from '../../../../lib/database/supabase';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const event = await request.json();
    console.log("Daily Webhook Received:", event.type);
    
    // Logic: Ready to download means the lesson is over
    if (event.type === "recording.ready-to-download") {
      const downloadUrl = event.data.object.download_url;
      const roomName = event.data.object.room_name;
      const lessonId = roomName.replace('lesson-', '');

      // 1. Byte Transfer Daily -> Supabase Storage
      const fileRes = await fetch(downloadUrl);
      const buffer = Buffer.from(await fileRes.arrayBuffer());
      const filePath = `recordings/${lessonId}-${Date.now()}.mp4`;

      const { data, error } = await supabase.storage
        .from('tutor-videos')
        .upload(filePath, buffer, { contentType: 'video/mp4' });

      if (error) throw error;

      // 2. Map file to Lesson Record
      const client = await clientPromise;
      const db = client.db("lernitt-v2");
      const { publicUrl } = supabase.storage.from('tutor-videos').getPublicUrl(filePath).data;

      await db.collection("lessons").updateOne(
        { _id: new ObjectId(lessonId) },
        { $set: { 
            recordingUrl: publicUrl, 
            recordingStatus: 'uploaded',
            status: 'completed' // Force completion status
          } 
        }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook Execution Error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
