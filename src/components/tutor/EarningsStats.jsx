"use client";
import React, { useEffect, useState } from 'react';

/**
 * Earnings Stats UI
 * High-level visual cards for money and lesson distribution.
 *
 */
export default function EarningsStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/tutor/stats');
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error("Dashboard stats fetch failed");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="stats-loading">CALCULATING_METRICS...</div>;
  if (!data) return null;

  const totalLessons = Object.values(data.chartData).reduce((a, b) => a + b, 0);

  return (
    <div className="stats-grid">
      {/* Money Cards */}
      <div className="stat-card primary">
        <span className="label">Total Earned (Net)</span>
        <span className="value">${data.summary.totalEarned.toFixed(2)}</span>
        <div className="sub-text">After 15% Lernitt Fee</div>
      </div>

      <div className="stat-card">
        <span className="label">Lessons This Week</span>
        <span className="value">{data.weekly.lessons}</span>
        <div className="trend">Weekly Income: ${data.weekly.income.toFixed(2)}</div>
      </div>

      {/* Visual Progress Chart (Hardware Safe) */}
      <div className="stat-card wide">
        <span className="label">Lesson Performance</span>
        <div className="bar-chart-container">
          <div className="bar-labels">
            <span>Completed: {data.chartData.completed || 0}</span>
            <span>Disputed: {data.chartData.disputed || 0}</span>
            <span>Cancelled: {data.chartData.cancelled || 0}</span>
          </div>
          <div className="visual-bar">
            <div 
              className="segment completed" 
              style={{ width: `${((data.chartData.completed || 0) / totalLessons) * 100}%` }} 
            />
            <div 
              className="segment disputed" 
              style={{ width: `${((data.chartData.disputed || 0) / totalLessons) * 100}%` }} 
            />
            <div 
              className="segment cancelled" 
              style={{ width: `${((data.chartData.cancelled || 0) / totalLessons) * 100}%` }} 
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-family: system-ui, sans-serif; }
        .stat-card { background: #fff; border: 4px solid #000; padding: 24px; border-radius: 24px; box-shadow: 8px 8px 0px 0px #000; }
        .stat-card.primary { background: #facc15; }
        .stat-card.wide { grid-column: span 2; }
        
        .label { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 8px; }
        .value { display: block; font-size: 36px; font-weight: 900; color: #000; letter-spacing: -1.5px; }
        .sub-text { font-size: 11px; font-weight: 700; opacity: 0.6; margin-top: 4px; }
        .trend { font-size: 12px; font-weight: 800; color: #16a34a; margin-top: 4px; }
        
        .bar-chart-container { margin-top: 15px; }
        .bar-labels { display: flex; justify-content: space-between; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; }
        .visual-bar { height: 12px; background: #eee; border-radius: 6px; overflow: hidden; display: flex; border: 2px solid #000; }
        .segment.completed { background: #22c55e; }
        .segment.disputed { background: #ef4444; }
        .segment.cancelled { background: #94a3b8; }
        
        .stats-loading { padding: 40px; text-align: center; font-weight: 900; font-size: 12px; letter-spacing: 2px; }
      `}</style>
    </div>
  );
}
