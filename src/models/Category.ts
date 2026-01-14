// @ts-nocheck
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  level: 'topic' | 'subject' | 'subcategory'; // The three layers preserved
  parent?: mongoose.Types.ObjectId; // Hierarchical links preserved
  active: boolean;
  // Merged: Added for sophisticated curriculum planning
  description?: string; 
  updatedAt: Date;
  createdAt: Date;
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
    // Merged: Sophisticated curriculum details
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

// Preserved and optimized indexes for fast lookups
CategorySchema.index({ level: 1 });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ slug: 1 });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
