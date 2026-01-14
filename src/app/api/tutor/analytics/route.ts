import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; 
import Lesson from '@/models/Lesson';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tutorId = searchParams.get('tutorId');

  if (!tutorId) {
    return NextResponse.json({ error: 'Tutor ID required' }, { status: 400 });
  }

  await dbConnect();

  try {
    // 1. Calculate Retention: Students with 3 or more completed lessons
    const retentionData = await Lesson.aggregate([
      { $match: { tutorId: new mongoose.Types.ObjectId(tutorId), status: 'completed' } },
      { $group: { _id: "$studentId", count: { $sum: 1 } } }
    ]);
    
    const loyalStudents = retentionData.filter(s => s.count >= 3).length;
    const retentionRate = retentionData.length > 0 
      ? ((loyalStudents / retentionData.length) * 100).toFixed(1) 
      : 0;

    // 2. Curriculum Planning: Get latest progress per student
    const curriculumPlanning = await Lesson.aggregate([
      { $match: { tutorId: new mongoose.Types.ObjectId(tutorId) } },
      { $sort: { scheduledTime: -1 } },
      { $group: {
          _id: "$studentId",
          currentModule: { $first: "$curriculumUnit" },
          lastTutorNote: { $first: "$progressNote" },
          lastSessionDate: { $first: "$scheduledTime" }
      }},
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "student" } },
      { $unwind: "$student" }
    ]);

    return NextResponse.json({
      summary: {
        retentionRate: `${retentionRate}%`,
        activeStudentCount: retentionData.length,
        loyalStudentCount: loyalStudents
      },
      pacing: curriculumPlanning.map(p => ({
        studentName: p.student.name,
        module: p.currentModule || "Baseline Assessment",
        notes: p.lastTutorNote || "No notes provided",
        date: p.lastSessionDate
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
