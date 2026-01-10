// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

export const CategoryManager = {
  /**
   * Create a category at any of the 3 levels.
   * Example: create('Languages', 'topic') 
   * Example: create('English', 'subject', topicId)
   */
  async create(name: string, level: 'topic' | 'subject' | 'subcategory', parentId: string | null = null) {
    const dbClient = await clientPromise;
    const db = dbClient.db();
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const newCategory = {
      name,
      slug,
      level,
      parent: parentId ? new ObjectId(parentId) : null,
      active: true,
      createdAt: new Date()
    };

    return await db.collection('categories').insertOne(newCategory);
  },

  /**
   * Fetches the entire 3-layer structure for the Admin UI.
   */
  async getFullHierarchy() {
    const dbClient = await clientPromise;
    const db = dbClient.db();
    const all = await db.collection('categories').find({ active: true }).toArray();
    
    // 1. Get Top Level (Topics)
    const topics = all.filter(c => c.level === 'topic');

    return topics.map(topic => {
      // 2. Get Subjects for each Topic
      const subjects = all.filter(c => 
        c.level === 'subject' && 
        c.parent && c.parent.toString() === topic._id.toString()
      );

      return {
        ...topic,
        subjects: subjects.map(subject => ({
          ...subject,
          // 3. Get Sub-categories for each Subject
          subcategories: all.filter(c => 
            c.level === 'subcategory' && 
            c.parent && c.parent.toString() === subject._id.toString()
          )
        }))
      };
    });
  },

  async delete(categoryId: string) {
    const dbClient = await clientPromise;
    const db = dbClient.db();
    return await db.collection('categories').updateOne(
      { _id: new ObjectId(categoryId) },
      { $set: { active: false, updatedAt: new Date() } }
    );
  }
};
