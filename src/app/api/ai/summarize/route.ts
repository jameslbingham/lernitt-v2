// @ts-nocheck
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from '../../../../lib/database/mongodb';
import { sendLernittEmail, buildSummaryTemplate } from '../../../../lib/utils/emailUtil';
import { ObjectId } from 'mongodb';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * LERNITT-V2 MASTER AI CHAIN
 * Single-Pass Analysis, Storage, and Notification.
 */
export async function POST(request: Request) {
  try {
    const { lessonId, videoUrl } = await request.json();
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    // 1. Fetch Lesson & User Data
    const lesson = await db.collection("lessons").findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    const student = await db.collection("users").findOne({ _id: new ObjectId(lesson.studentId) });
    const tutor = await db.collection("users").findOne({ _id: new ObjectId(lesson.tutorId) });

    // 2. Multimodal Analysis (Gemini 2.0 Flash)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const videoResp = await fetch(videoUrl);
    const videoData = await videoResp.arrayBuffer();

    const prompt = `
      You are a professional language learning assistant. 
      Analyze this lesson video between Tutor ${tutor.name} and Student ${student.name}.
      Return a structured summary including:
      - TOPICS: What was discussed?
      - VOCABULARY: List 5-10 new words or phrases used.
      - IMPROVEMENT: 3 specific areas where the student can improve grammar or pronunciation.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: Buffer.from(videoData).toString("base64"), mimeType: "video/mp4" } }
    ]);

    const aiSummary = result.response.text();

    // 3. Save to Notebook Database
    const notebookEntry = {
      studentId: student._id,
      lessonId: new ObjectId(lessonId),
      tutorName: tutor.name,
      title: `AI Recap: Lesson with ${tutor.name}`,
      content: aiSummary,
      createdAt: new Date(),
      isAiGenerated: true
    };
    await db.collection("notebooks").insertOne(notebookEntry);

    // 4. Dispatch Email Notifications
    const emailHtml = buildSummaryTemplate(student.name, aiSummary);
    await sendLernittEmail({
      to: [student.email, tutor.email],
      subject: `Your Lesson Recap with ${tutor.name} is Ready! 📝`,
      html: emailHtml
    });

    return NextResponse.json({ 
      success: true, 
      message: "Lesson processed, saved to notebook, and emailed." 
    });

  } catch (error) {
    console.error("❌ AI_CHAIN_FAILURE:", error);
    return NextResponse.json({ error: "Agentic process failed" }, { status: 500 });
  }
}
