// @ts-nocheck
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; 
import Lesson from '@/models/Lesson';
import Category from '@/models/Category'; 
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tutorId = searchParams.get('tutorId');

  // Validate the tutor ID before proceeding
  if (!tutorId || !mongoose.Types.ObjectId.isValid(tutorId)) {
    return NextResponse.json({ error: 'Valid Tutor ID required' }, { status: 400 });
  }

  await dbConnect();

  try {
    // 1. Retention Metrics: Analyze students with 3+ completed lessons
    const retentionStats = await Lesson.aggregate([
      { $match: { tutorId: new mongoose.Types.ObjectId(tutorId), status: 'completed' } },
      { $group: { _id: "$studentId", sessionCount: { $sum: 1 } } }
    ]);
    
    const loyalStudents = retentionStats.filter(s => s.sessionCount >= 3).length;
    const totalStudents = retentionStats.length;
    const retentionRate = totalStudents > 0 
      ? ((loyalStudents / totalStudents) * 100).toFixed(1) 
      : 0;

    // 2. Sophisticated Curriculum Pacing with the 3-Layer Hierarchy
    const curriculumPlanning = await Lesson.aggregate([
      { $match: { tutorId: new mongoose.Types.ObjectId(tutorId) } },
      { $sort: { scheduledTime: -1 } },
      { $group: {
          _id: "$studentId",
          categoryId: { $first: "$categoryId" },
          currentUnit: { $first: "$curriculumUnit" },
          lastTutorNote: { $first: "$progressNote" },
          lastLessonDate: { $first: "$scheduledTime" }
      }},
      // Join with Category model to resolve Topic, Subject, and Sub-category names
      { $lookup: { 
          from: "categories", 
          localField: "categoryId", 
          foreignField: "_id", 
          as: "categoryDetails" 
      }},
      { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
      // Join with User model to get Student Name
      { $lookup: { 
          from: "users", 
          localField: "_id", 
          foreignField: "_id", 
          as: "studentInfo" 
      }},
      { $unwind: "$studentInfo" }
    ]);

    // 3. Financial Forecast Logic
    const forecast = await Lesson.aggregate([
      { $match: { 
          tutorId: new mongoose.Types.ObjectId(tutorId), 
          status: 'scheduled',
          scheduledTime: { $gte: new Date() } 
      }},
      { $group: { _id: null, totalProjected: { $sum: "$price" } } }
    ]);

    return NextResponse.json({
      summary: {
        retentionRate: `${retentionRate}%`,
        activeStudentCount: totalStudents,
        loyalStudentCount: loyalStudents,
        projectedIncome: forecast[0]?.totalProjected || 0
      },
      pacing: curriculumPlanning.map(p => ({
        studentName: p.studentInfo.name,
        // Detailed 3-layer view for the tutor
        hierarchy: {
          topic: p.categoryDetails?.name && p.categoryDetails.level === 'topic' ? p.categoryDetails.name : "N/A",
          subject: p.categoryDetails?.name && p.categoryDetails.level === 'subject' ? p.categoryDetails.name : "N/A",
          subCategory: p.categoryDetails?.name && p.categoryDetails.level === 'subcategory' ? p.categoryDetails.name : "General"
        },
        module: p.currentUnit || "Baseline Assessment",
        notes: p.lastTutorNote || "No notes provided",
        date: p.lastLessonDate
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
