"use client";
import React, { useState, useEffect } from 'react';

export default function ProfileForm() {
  const [profile, setProfile] = useState({
    displayName: "",
    headline: "",
    bio: "",
    languages: "",
    hourlyRate: "",
    videoUrl: "",
    avatarUrl: ""
  });
  const [status, setStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/tutor/profile');
      const data = await res.json();
      if (data) {
        setProfile({
          displayName: data.displayName || "",
          headline: data.headline || "",
          bio: data.bio || "",
          languages: data.languages ? data.languages.join(", ") : "",
          hourlyRate: data.hourlyRate || "",
          videoUrl: data.videoUrl || "",
          avatarUrl: data.avatarUrl || ""
        });
        setStatus(data.tutorStatus || "none");
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/tutor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          languages: profile.languages.split(",").map(l => l.trim())
        })
      });
      if (res.ok) {
        alert("Your profile has been submitted for review.");
        window.location.reload();
      }
    } catch (err) {
      alert("Error submitting profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">SYNCING_PROFILE_DATA...</div>;

  return (
    <div className="onboarding-box">
      <div className={`status-pill ${status}`}>
        Status: <strong>{status.toUpperCase()}</strong>
      </div>
      
      <p className="hint">
        {status === 'pending' 
          ? "Admin Bob is currently reviewing your introduction video and bio." 
          : "Fill out your details to begin teaching."}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Public Name</label>
          <input value={profile.displayName} onChange={e => setProfile({...profile, displayName: e.target.value})} required />
        </div>

        <div className="input-group">
          <label>Professional Headline</label>
          <input value={profile.headline} onChange={e => setProfile({...profile, headline: e.target.value})} placeholder="e.g. IELTS Specialist & Conversation Expert" required />
        </div>

        <div className="input-group">
          <label>Bio & Experience</label>
          <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Tell students about your methodology..." required />
        </div>

        <div className="split-row">
          <div className="input-group">
            <label>Hourly Rate (USD)</label>
            <input type="number" value={profile.hourlyRate} onChange={e => setProfile({...profile, hourlyRate: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Intro Video URL (YouTube/Vimeo)</label>
            <input type="url" value={profile.videoUrl} onChange={e => setProfile({...profile, videoUrl: e.target.value})} placeholder="Verification requires a 1-2 min video" required />
          </div>
        </div>

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? "Processing..." : "Submit for Approval"}
        </button>
      </form>

      <style jsx>{`
        .onboarding-box { background: #fff; border: 4px solid #000; border-radius: 24px; padding: 30px; box-shadow: 10px 10px 0px 0px #000; }
        .status-pill { display: inline-block; padding: 6px 12px; border-radius: 8px; border: 2px solid #000; font-size: 11px; font-weight: 900; margin-bottom: 10px; }
        .pending { background: #fef9c3; color: #854d0e; }
        .approved { background: #dcfce7; color: #166534; }
        .hint { font-size: 12px; color: #666; font-weight: 700; margin-bottom: 30px; }
        
        .input-group { margin-bottom: 20px; }
        label { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 6px; }
        input, textarea { width: 100%; padding: 12px; border: 2px solid #000; border-radius: 12px; font-size: 14px; font-family: inherit; font-weight: 600; }
        textarea { height: 120px; resize: none; }
        .split-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        .save-btn { width: 100%; background: #000; color: #fff; border: none; padding: 15px; border-radius: 12px; font-weight: 900; text-transform: uppercase; cursor: pointer; transition: 0.2s; margin-top: 10px; }
        .save-btn:hover { background: #4f46e5; transform: translateY(-2px); }
        .loading { padding: 50px; text-align: center; font-weight: 900; letter-spacing: 2px; }
      `}</style>
    </div>
  );
}
