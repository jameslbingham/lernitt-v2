// @ts-nocheck
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import mongoose from 'mongoose';

/**
 * PATCH Handler to update lesson curriculum data.
 * This is where the tutor saves the curriculum unit and progress notes 
 * for student retention.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid Lesson ID' }, { status: 400 });
  }

  await dbConnect();

  try {
    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      {
        categoryId: body.categoryId,
        curriculumUnit: body.curriculumUnit,
        progressNote: body.progressNote,
        status: body.status || 'completed'
      },
      { new: true } // Returns the updated document
    );

    if (!updatedLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLesson);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Update failed: ' + error.message }, 
      { status: 500 }
    );
  }
}
