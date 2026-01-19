// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../../../../lib/database/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: Request) {
  const { lessonId, videoUrl } = await request.json();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // 1. Fetch Video from Supabase
  const videoResp = await fetch(videoUrl);
  const videoData = await videoResp.arrayBuffer();

  // 2. Single-Pass Prompt
  const prompt = "You are a professional language learning assistant. Summarize this lesson, list new vocabulary, and provide Alice with 3 specific areas for grammatical improvement.";

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: Buffer.from(videoData).toString("base64"), mimeType: "video/mp4" } }
  ]);

  const summaryText = result.response.text();

  // 3. Save to Alice's Notebook
  // (Logic to POST to /api/student/notebooks goes here)

  return Response.json({ success: true, summary: summaryText });
}
