"use client";
import React, { useEffect, useState } from 'react';

/**
 * Trial Badge
 * Ported from v1 TutorProfile.jsx with enhanced visibility
 */
export default function TrialBadge({ tutorId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrialData() {
      try {
        const res = await fetch(`/api/lessons/trial-summary/${tutorId}`);
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error("Trial Badge fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (tutorId) loadTrialData();
  }, [tutorId]);

  if (loading) return <span className="trial-loading">Checking trial status...</span>;
  if (!data) return null;

  const canBook = data.totalUsed < data.limitTotal && !data.usedWithTutor;

  return (
    <div className={`trial-badge ${canBook ? 'active' : 'exhausted'}`}>
      <span className="badge-text">
        {canBook ? (
          <>Trials {data.totalUsed}/{data.limitTotal} • Available</>
        ) : (
          <>Trials {data.totalUsed}/{data.limitTotal} • {data.usedWithTutor ? "Tutor Limit Reached" : "Limit Reached"}</>
        )}
      </span>

      <style jsx>{`
        .trial-badge {
          display: inline-flex;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          border: 2px solid #000;
          font-family: system-ui, sans-serif;
        }
        .active { background: #facc15; color: #000; }
        .exhausted { background: #f3f4f6; color: #9ca3af; border-color: #e5e7eb; }
        .trial-loading { font-size: 11px; color: #999; font-weight: bold; }
      `}</style>
    </div>
  );
}
