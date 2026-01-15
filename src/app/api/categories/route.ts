// @ts-nocheck
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

/**
 * GET Handler to retrieve the 3-layer hierarchy.
 * This feeds the tutor-facing forms so they can categorize lessons 
 * into Topics, Subjects, and Sub-categories.
 */
export async function GET() {
  await dbConnect();

  try {
    // Fetch all categories and sort them by level to make the dropdown organized
    const categories = await Category.find({ active: true })
      .sort({ level: 1, name: 1 })
      .lean();

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch categories: ' + error.message }, 
      { status: 500 }
    );
  }
}
