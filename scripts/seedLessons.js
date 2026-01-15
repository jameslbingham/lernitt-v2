import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }));
  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

  const tutor = await User.findOne({ role: 'tutor' });
  const algebra = await Category.findOne({ slug: 'algebra' });

  if (!tutor || !algebra) {
    console.log("Run seedCategories.js first!");
    process.exit(1);
  }

  await User.deleteMany({ role: 'student' });
  const student = await User.create({ name: 'Alice Johnson', role: 'student', email: 'alice@test.com' });

  await Lesson.deleteMany({});
  await Lesson.create({
    tutorId: tutor._id,
    studentId: student._id,
    categoryId: algebra._id,
    scheduledTime: new Date(),
    status: 'completed',
    price: 50,
    curriculumUnit: 'Algebra Module 1',
    progressNote: 'Alice is doing great with basic variables.'
  });

  tutor.totalEarnings = 50;
  await tutor.save();

  console.log('V2 Lessons and Balance Seeded Successfully.');
  process.exit(0);
}
seed();
