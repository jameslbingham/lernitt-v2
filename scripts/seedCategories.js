import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Use the existing V2 Model but we import the schema via mongoose
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const seedData = [
  { name: 'Mathematics', slug: 'mathematics', level: 'topic', active: true },
  { name: 'Science', slug: 'science', level: 'topic', active: true },
  { name: 'Algebra', slug: 'algebra', level: 'subject', active: true },
  { name: 'Calculus', slug: 'calculus', level: 'subject', active: true },
  { name: 'Quadratic Equations', slug: 'quadratics', level: 'subcategory', active: true }
];

async function seed() {
  if (!MONGODB_URI) return console.error('No URI found');
  await mongoose.connect(MONGODB_URI);
  
  // We use the model name directly since the schema is already registered by the app
  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
    name: String, slug: String, level: String, parent: mongoose.Schema.Types.ObjectId, active: Boolean
  }));

  await Category.deleteMany({});
  const created = await Category.insertMany(seedData);

  const math = created.find(c => c.slug === 'mathematics');
  const algebra = created.find(c => c.slug === 'algebra');
  const quadratics = created.find(c => c.slug === 'quadratics');

  if (math && algebra && quadratics) {
    await Category.findByIdAndUpdate(algebra._id, { parent: math._id });
    await Category.findByIdAndUpdate(quadratics._id, { parent: algebra._id });
  }

  console.log('V2 Categories Seeded Successfully.');
  process.exit(0);
}
seed();
