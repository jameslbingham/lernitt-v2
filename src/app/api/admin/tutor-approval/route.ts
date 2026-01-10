// @ts-nocheck
import { NextResponse } from 'next/server';
import { updateTutorStatus } from '@/lib/utils/tutorApproval';

export async function PATCH(req: Request) {
  try {
    const { tutorId, status } = await req.json();

    if (!tutorId || !status) {
      return NextResponse.json(
        { error: 'Missing tutorId or status' }, 
        { status: 400 }
      );
    }

    // Call the utility logic we just created
    const result = await updateTutorStatus(tutorId, status);

    if (!result.success) {
      return NextResponse.json(
        { error: result.reason }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: `Tutor status updated successfully to ${status}`,
      tutorId 
    });

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
