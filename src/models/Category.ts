// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  level: 'topic' | 'subject' | 'subcategory'; // The three layers you requested
  parent?: mongoose.Types.ObjectId; // Subjects point to Topics; Sub-categories point to Subjects
  active: boolean;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    level: { 
      type: String, 
      enum: ['topic', 'subject', 'subcategory'], 
      required: true 
    },
    parent: { 
      type: Schema.Types.ObjectId, 
      ref: 'Category', 
      default: null 
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexing for fast lookups by level and parent
CategorySchema.index({ level: 1 });
CategorySchema.index({ parent: 1 });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
