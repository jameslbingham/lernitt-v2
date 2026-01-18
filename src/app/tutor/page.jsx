// @ts-nocheck
import React from 'react';
import EarningsStats from '../../components/tutor/EarningsStats';
import Link from 'next/link';

/**
 * Main Tutor Dashboard (Private)
 * Central hub for Bob to view his marketplace performance.
 */
export default function TutorDashboardPage() {
  return (
    <div className="dashboard-wrapper">
      <header className="dash-header">
        <div className="header-text">
          <h1>Tutor Dashboard</h1>
          <p>Real-time earnings and performance metrics.</p>
        </div>
        <div className="header-actions">
          <Link href="/tutor/profile" className="btn-secondary">Edit Profile</Link>
          <Link href="/tutor/payouts" className="btn-primary">Payout Settings</Link>
        </div>
      </header>

      <section className="dashboard-content">
        {/* Visual Stats Component linked to the /api/tutor/stats route */}
        <EarningsStats />
      </section>

      <style jsx>{`
        .dashboard-wrapper { 
          padding: 40px; 
          max-width: 1000px; 
          margin: 0 auto; 
          font-family: system-ui, -apple-system, sans-serif; 
        }
        .dash-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end; 
          margin-bottom: 40px; 
          border-bottom: 4px solid #000; 
          padding-bottom: 24px; 
        }
        
        h1 { 
          margin: 0; 
          font-size: 48px; 
          font-weight: 900; 
          text-transform: uppercase; 
          letter-spacing: -2px; 
          line-height: 1;
        }
        p { 
          margin: 8px 0 0; 
          font-weight: 700; 
          color: #666; 
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 1px;
        }
        
        .header-actions { display: flex; gap: 12px; }
        .btn-primary { 
          background: #000; 
          color: #fff; 
          padding: 14px 24px; 
          border-radius: 14px; 
          font-weight: 900; 
          text-transform: uppercase; 
          text-decoration: none; 
          font-size: 11px; 
          transition: 0.2s; 
          border: 3px solid #000;
        }
        .btn-secondary { 
          background: #fff; 
          color: #000; 
          padding: 14px 24px; 
          border-radius: 14px; 
          font-weight: 900; 
          text-transform: uppercase; 
          text-decoration: none; 
          font-size: 11px; 
          border: 3px solid #000;
        }
        .btn-primary:hover { 
          background: #4f46e5; 
          border-color: #4f46e5;
          transform: translateY(-3px); 
          box-shadow: 0 10px 20px -10px #4f46e5;
        }
        .btn-secondary:hover {
          background: #f9f9f9;
          transform: translateY(-3px);
        }
        
        .dashboard-content { margin-top: 20px; }
      `}</style>
    </div>
  );
}
