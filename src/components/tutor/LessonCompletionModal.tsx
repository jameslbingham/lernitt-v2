'use client';
import { useState } from 'react';

export default function LessonCompletionModal({ tutorEmail }: { tutorEmail: string }) {
  const [loading, setLoading] = useState(false);

  const completeLesson = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tutor/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorEmail, amount: 25 })
      });
      if (res.ok) window.location.reload();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={completeLesson}
      disabled={loading}
      className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Test: Complete $25.00 Lesson'}
    </button>
  );
}
