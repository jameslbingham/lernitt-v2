// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';

export default function LessonUpdateForm({ lessonId, tutorId }: { lessonId: string, tutorId: string }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    curriculumUnit: '',
    progressNote: '',
    status: 'completed'
  });

  // Fetch the 3-layer categories for the selection dropdown
  useEffect(() => {
    async function loadCategories() {
      const res = await fetch('/api/categories'); // You will need this endpoint next
      const data = await res.json();
      setCategories(data);
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) alert('Curriculum updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-slate-800">Post-Lesson Curriculum Tracking</h3>
      
      {/* Category Selection (3-Layer Hierarchy) */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Select Hierarchy Level</label>
        <select 
          className="w-full p-2 border rounded-md"
          value={formData.categoryId}
          onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
          required
        >
          <option value="">-- Select Topic/Subject/Subcategory --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.level.toUpperCase()}: {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Specific Unit Name */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Specific Curriculum Unit</label>
        <input 
          type="text" 
          placeholder="e.g. Intro to Quadratic Equations"
          className="w-full p-2 border rounded-md"
          value={formData.curriculumUnit}
          onChange={(e) => setFormData({...formData, curriculumUnit: e.target.value})}
        />
      </div>

      {/* Progress Note for Retention */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Retention Note (For Next Lesson)</label>
        <textarea 
          placeholder="What should the student review next time?"
          className="w-full p-2 border rounded-md h-24"
          value={formData.progressNote}
          onChange={(e) => setFormData({...formData, progressNote: e.target.value})}
        />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition">
        Save Curriculum Progress
      </button>
    </form>
  );
}
