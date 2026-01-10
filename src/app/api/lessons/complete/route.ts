// @ts-nocheck
import { NextResponse } from 'next/server';
import { completeLesson } from '@/lib/utils/lessonCompletion';

export async function PATCH(req: Request) {
  try {
    const { lessonId, tutorId } = await req.json();

    if (!lessonId || !tutorId) {
      return NextResponse.json({ error: 'Missing lessonId or tutorId' }, { status: 400 });
    }

    const result = await completeLesson(lessonId, tutorId);

    if (!result.success) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({ message: result.message });

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
