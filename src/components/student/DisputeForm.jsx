"use client";
import React, { useState } from 'react';

/**
 * Student Dispute Form
 * Allows Alice to contest a lesson. Sets status to 'disputed' to lock funds.
 */
export default function DisputeForm({ lessonId, lessonSubject, onSuccess }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return alert("Please provide a reason for the dispute.");

    setLoading(true);
    try {
      const res = await fetch('/api/student/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, reason })
      });

      if (res.ok) {
        alert("Dispute submitted. Admin will review this case.");
        if (onSuccess) onSuccess();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert("Failed to submit dispute.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dispute-box">
      <h3>Report a Problem</h3>
      <p className="lesson-ref">Case for: <strong>{lessonSubject}</strong></p>
      
      <form onSubmit={handleSubmit}>
        <label>What happened?</label>
        <textarea 
          placeholder="e.g., Tutor did not show up, or technical issues prevented the lesson."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "SUBMITTING..." : "OPEN DISPUTE"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .dispute-box { background: #fff; border: 3px solid #000; padding: 20px; border-radius: 16px; margin-top: 20px; }
        h3 { margin: 0 0 10px; font-weight: 900; text-transform: uppercase; font-size: 16px; }
        .lesson-ref { font-size: 12px; color: #666; margin-bottom: 15px; }
        label { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px; }
        textarea { width: 100%; height: 100px; padding: 10px; border: 2px solid #000; border-radius: 8px; font-family: inherit; font-size: 14px; margin-bottom: 15px; }
        .submit-btn { background: #ef4444; color: #fff; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 900; cursor: pointer; text-transform: uppercase; width: 100%; transition: 0.2s; }
        .submit-btn:hover { background: #000; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
