// @ts-nocheck
import mongoose from 'mongoose';
import Category from '../src/models/Category'; // Correct path to your V2 model
import dotenv from 'dotenv';

// Load environment variables from your local env file
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const seedData = [
  // LAYER 1: TOPICS
  { name: 'Mathematics', slug: 'mathematics', level: 'topic', active: true },
  { name: 'Science', slug: 'science', level: 'topic', active: true },
  { name: 'Languages', slug: 'languages', level: 'topic', active: true },

  // LAYER 2: SUBJECTS
  { name: 'Algebra', slug: 'algebra', level: 'subject', active: true },
  { name: 'Chemistry', slug: 'chemistry', level: 'subject', active: true },
  { name: 'English Literature', slug: 'english-lit', level: 'subject', active: true },

  // LAYER 3: SUB-CATEGORIES
  { name: 'Quadratic Equations', slug: 'quadratics', level: 'subcategory', active: true },
  { name: 'Organic Chemistry', slug: 'organic-chem', level: 'subcategory', active: true },
  { name: 'Shakespearean Plays', slug: 'shakespeare', level: 'subcategory', active: true },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing categories to ensure a clean V2 hierarchy
    await Category.deleteMany({});
    console.log('Cleared existing categories.');

    // 1. Insert all items
    const createdItems = await Category.insertMany(seedData);
    console.log(`Inserted ${createdItems.length} category items.`);

    // 2. Map the hierarchy links (Linking Parents)
    const math = createdItems.find(c => c.slug === 'mathematics');
    const algebra = createdItems.find(c => c.slug === 'algebra');
    const quadratics = createdItems.find(c => c.slug === 'quadratics');

    const science = createdItems.find(c => c.slug === 'science');
    const chemistry = createdItems.find(c => c.slug === 'chemistry');
    const organic = createdItems.find(c => c.slug === 'organic-chem');

    // Link Math Tree
    if (math && algebra && quadratics) {
      await Category.findByIdAndUpdate(algebra._id, { parent: math._id });
      await Category.findByIdAndUpdate(quadratics._id, { parent: algebra._id });
    }

    // Link Science Tree
    if (science && chemistry && organic) {
      await Category.findByIdAndUpdate(chemistry._id, { parent: science._id });
      await Category.findByIdAndUpdate(organic._id, { parent: chemistry._id });
    }

    console.log('3-Layer Hierarchy successfully linked.');
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
