// @ts-nocheck
import { NextResponse } from 'next/server';
import { requestReschedule } from '@/lib/utils/reschedule';

export async function PATCH(req: Request) {
  try {
    const { lessonId, userId, newStartTime, newEndTime } = await req.json();

    if (!lessonId || !userId || !newStartTime || !newEndTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await requestReschedule(lessonId, userId, newStartTime, newEndTime);

    if (!result.success) {
      return NextResponse.json({ error: result.reason }, { status: 403 });
    }

    return NextResponse.json({ message: result.message });

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
