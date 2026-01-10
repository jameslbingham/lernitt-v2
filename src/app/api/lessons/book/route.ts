// @ts-nocheck
import { NextResponse } from 'next/server';
import { createLessonBooking } from '@/lib/utils/booking';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // In v2, we will eventually get studentId from the Session
    // For now, we expect it in the body to test the logic
    const result = await createLessonBooking(body);

    if (!result.success) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Lesson booked successfully', 
      lessonId: result.lessonId 
    }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
