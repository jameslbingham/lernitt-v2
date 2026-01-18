// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import DisputeForm from '../../../../components/student/DisputeForm';

export default function StudentLessonDetailPage({ params }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDispute, setShowDispute] = useState(false);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${params.id}`);
      const data = await res.json();
      setLesson(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [params.id]);

  if (loading) return <div style={{padding: '40px', fontWeight: '900'}}>LOADING_LESSON_DETAILS...</div>;
  if (!lesson) return <div>Lesson not found.</div>;

  return (
    <div className="page-wrapper">
      <div className="detail-card">
        <header>
          <h1>{lesson.subject || "Private Lesson"}</h1>
          <span className={`status-tag ${lesson.status}`}>{lesson.status}</span>
        </header>

        <section className="meta">
          <p><strong>Tutor:</strong> {lesson.tutorName}</p>
          <p><strong>Time:</strong> {new Date(lesson.startTime).toLocaleString()}</p>
          <p><strong>Price:</strong> ${lesson.price?.toFixed(2)}</p>
        </section>

        <div className="button-row">
          {lesson.status === 'completed' && !lesson.isDisputed && (
            <button 
              className="report-btn" 
              onClick={() => setShowDispute(!showDispute)}
            >
              {showDispute ? "Close Form" : "Report a Problem"}
            </button>
          )}
          <button className="back-btn" onClick={() => window.history.back()}>Back</button>
        </div>

        {showDispute && (
          <DisputeForm 
            lessonId={lesson._id} 
            lessonSubject={lesson.subject} 
            onSuccess={() => {
              setShowDispute(false);
              fetchLesson();
            }}
          />
        )}
      </div>

      <style jsx>{`
        .page-wrapper { padding: 40px; background: #f9f9f9; min-height: 100vh; font-family: sans-serif; }
        .detail-card { max-width: 600px; margin: 0 auto; background: #fff; border: 4px solid #000; border-radius: 24px; padding: 30px; box-shadow: 10px 10px 0px 0px #000; }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        h1 { margin: 0; font-weight: 900; text-transform: uppercase; font-size: 24px; }
        .status-tag { padding: 5px 12px; border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; border: 2px solid #000; }
        .completed { background: #dcfce7; }
        .disputed { background: #fee2e2; color: #ef4444; }
        .meta p { margin: 8px 0; font-size: 14px; }
        .button-row { display: flex; gap: 10px; margin-top: 20px; }
        .report-btn { background: #fff; border: 2px solid #ef4444; color: #ef4444; padding: 10px 15px; border-radius: 10px; font-weight: 900; font-size: 10px; text-transform: uppercase; cursor: pointer; }
        .back-btn { background: #eee; border: none; padding: 10px 15px; border-radius: 10px; font-weight: 900; font-size: 10px; text-transform: uppercase; cursor: pointer; }
      `}</style>
    </div>
  );
}
