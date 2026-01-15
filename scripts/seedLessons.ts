// @ts-nocheck
import mongoose from 'mongoose';
import User from '../src/models/User';
import Lesson from '../src/models/Lesson';
import Category from '../src/models/Category';
import dotenv from 'dotenv';

// 1. Configure environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function seedLessons() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for Lesson seeding...');

    // 2. Locate the Tutor and Categories to link data
    const tutor = await User.findOne({ role: 'tutor' });
    const algebra = await Category.findOne({ slug: 'algebra' });
    const quadratics = await Category.findOne({ slug: 'quadratics' });

    if (!tutor || !algebra || !quadratics) {
      console.error('Missing required data. Ensure User (tutor) exists and Category seed has run.');
      process.exit(1);
    }

    // 3. Create Sample Students
    await User.deleteMany({ role: 'student' });
    const students = await User.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'student',
        timezone: 'UTC'
      },
      {
        name: 'Charlie Smith',
        email: 'charlie@example.com',
        role: 'student',
        timezone: 'UTC'
      }
    ]);

    // 4. Clear existing lessons
    await Lesson.deleteMany({});

    // 5. Generate "Loyal" Student Data (Alice)
    // 4 Completed lessons = High Retention on the dashboard
    const aliceLessons = [];
    for (let i = 0; i < 4; i++) {
      aliceLessons.push({
        tutorId: tutor._id,
        studentId: students[0]._id,
        categoryId: algebra._id,
        scheduledTime: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)), 
        durationMinutes: 60,
        status: 'completed',
        price: 50,
        curriculumUnit: `Algebra Basics - Module ${i + 1}`,
        progressNote: i === 3 ? "Review factoring next." : "Great progress."
      });
    }

    // 6. Generate "Forecast" Data (Charlie)
    // 1 Completed + 2 Scheduled = Demonstrates the Projected Income metric
    const charlieLessons = [
      {
        tutorId: tutor._id,
        studentId: students[1]._id,
        categoryId: quadratics._id,
        scheduledTime: new Date(Date.now() - 86400000), 
        status: 'completed',
        price: 60,
        curriculumUnit: 'Quadratic Intro',
        progressNote: 'Focus on graphs next session.'
      },
      {
        tutorId: tutor._id,
        studentId: students[1]._id,
        categoryId: quadratics._id,
        scheduledTime: new Date(Date.now() + 86400000), 
        status: 'scheduled',
        price: 60,
        curriculumUnit: 'Solving Equations'
      },
      {
        tutorId: tutor._id,
        studentId: students[1]._id,
        categoryId: quadratics._id,
        scheduledTime: new Date(Date.now() + (3 * 86400000)),
        status: 'scheduled',
        price: 60,
        curriculumUnit: 'Graphing Functions'
      }
    ];

    await Lesson.insertMany([...aliceLessons, ...charlieLessons]);

    // 7. Update Tutor balance to test the "Withdraw" feature
    tutor.totalEarnings = 260; // ($50x4) + $60
    await tutor.save();

    console.log('Seeding Complete: Students, Lessons, and Tutor Balance updated.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedLessons();
