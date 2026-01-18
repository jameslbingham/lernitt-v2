// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import TrialBadge from '../../../components/student/TrialBadge';

export default function TutorProfilePage({ params }) {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTutor() {
      try {
        const res = await fetch(`/api/tutors/${params.id}`);
        const data = await res.json();
        setTutor(data);
      } catch (err) {
        console.error("Load tutor error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTutor();
  }, [params.id]);

  if (loading) return <div style={{padding: '40px', fontWeight: '900'}}>LOADING_PROFILE...</div>;
  if (!tutor) return <div style={{padding: '40px'}}>Tutor not found.</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <header className="profile-header">
          <div className="avatar-section">
            {tutor.avatarUrl ? (
              <img src={tutor.avatarUrl} alt={tutor.name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar placeholder">{tutor.name?.[0]}</div>
            )}
          </div>
          
          <div className="name-section">
            <h1 className="tutor-name">{tutor.name}</h1>
            <p className="headline">{tutor.headline || "Lernitt Professional Tutor"}</p>
            <TrialBadge tutorId={params.id} />
          </div>
        </header>

        <section className="bio-section">
          <h3>Biography</h3>
          <p className="bio-text">{tutor.bio || "No biography provided."}</p>
        </section>

        <footer className="booking-bar">
          <div className="price-info">
            <span className="price-val">${tutor.hourlyRate?.toFixed(2)}</span>
            <span className="price-unit">/ hour</span>
          </div>
          <Link href={`/book/${params.id}`} className="book-now-btn">
            Schedule Lesson
          </Link>
        </footer>
      </div>

      <style jsx>{`
        .profile-container { padding: 40px; min-height: 100vh; background: #fafafa; font-family: sans-serif; }
        .profile-card { max-width: 720px; margin: 0 auto; background: #fff; border: 4px solid #000; border-radius: 24px; padding: 40px; box-shadow: 12px 12px 0px 0px #000; }
        
        .profile-header { display: flex; gap: 30px; align-items: center; margin-bottom: 30px; }
        .profile-avatar { width: 140px; height: 140px; border-radius: 24px; border: 4px solid #000; object-fit: cover; background: #eee; }
        .placeholder { display: flex; align-items: center; justify-content: center; font-size: 60px; font-weight: 900; background: #facc15; }
        
        .tutor-name { font-size: 36px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -1.5px; }
        .headline { color: #666; font-weight: 700; margin: 6px 0 16px 0; }
        
        .bio-section h3 { font-weight: 900; text-transform: uppercase; font-size: 14px; color: #999; margin-bottom: 12px; }
        .bio-text { line-height: 1.6; color: #333; font-size: 15px; }
        
        .booking-bar { margin-top: 40px; padding-top: 30px; border-top: 2px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .price-val { font-size: 28px; font-weight: 900; color: #000; }
        .price-unit { font-size: 14px; font-weight: 700; color: #666; margin-left: 5px; }
        
        .book-now-btn { background: #000; color: #fff; padding: 14px 28px; border-radius: 14px; font-weight: 900; text-transform: uppercase; text-decoration: none; transition: 0.2s; }
        .book-now-btn:hover { background: #4f46e5; transform: translateY(-3px); }
      `}</style>
    </div>
  );
}
