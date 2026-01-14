import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; 
import Lesson from '@/models/Lesson';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tutorId = searchParams.get('tutorId');

  if (!tutorId) return NextResponse.json({ error: 'Tutor ID required' }, { status: 400 });

  await dbConnect();

  try {
    // 1. Calculate Retention (Students with 3+ completed lessons)
    const retentionStats = await Lesson.aggregate([
      { $match: { tutorId: new mongoose.Types.ObjectId(tutorId), status: 'completed' } },
      { $group: { _id: "$studentId", sessionCount: { $sum: 1 } } }
    ]);
    const loyalStudents = retentionStats.filter(s => s.sessionCount >= 3).length;
    const retentionRate = retentionStats.length > 0 
      ? ((loyalStudents / retentionStats.length) * 100).toFixed(1) 
      : 0;

    // 2. Curriculum Pacing (Information to help plan the curriculum)
    const pacingData = await Lesson.aggregate([
      { $match: { tutorId: new mongoose.Types.ObjectId(tutorId) } },
      { $sort: { scheduledTime: -1 } },
      { $group: {
          _id: "$studentId",
          currentUnit: { $first: "$curriculumUnit" },
          lastTutorNote: { $first: "$progressNote" },
          lastLessonDate: { $first: "$scheduledTime" }
      }},
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "studentInfo" } },
      { $unwind: "$studentInfo" }
    ]);

    return NextResponse.json({
      summary: {
        retentionRate: `${retentionRate}%`,
        totalStudentReach: retentionStats.length,
        loyalStudentCount: loyalStudents
      },
      curriculumPlanning: pacingData.map(p => ({
        studentName: p.studentInfo.name,
        currentModule: p.currentUnit || "Baseline Assessment",
        notesForNextLesson: p.lastTutorNote || "Prepare curriculum",
        lastActivity: p.lastLessonDate
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
