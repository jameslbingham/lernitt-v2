// @ts-nocheck
import React from 'react';
import clientPromise from '../../../lib/database/mongodb';

/**
 * Server-side data aggregation for the Admin Dashboard.
 * This ensures the page loads with fresh data immediately.
 */
async function getAdminStats() {
  const client = await clientPromise;
  const db = client.db("lernitt-v2");

  // Aggregation logic ported from v1 finance.js
  const COMMISSION_RATE = 0.15;

  const payments = await db.collection("payments").aggregate([
    { $match: { status: "succeeded" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]).toArray();

  const liabilityData = await db.collection("users").aggregate([
    { $match: { role: "tutor" } },
    { $group: { _id: null, total: { $sum: "$totalEarnings" } } }
  ]).toArray();

  const gmv = payments[0]?.total || 0;
  const revenue = gmv * COMMISSION_RATE;
  const liability = liabilityData[0]?.total || 0;

  return { gmv, revenue, liability };
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <h1 className="admin-title">Marketplace Revenue</h1>
        <p className="admin-subtitle">Global Platform Overview</p>
      </header>

      <div className="kpi-container">
        {/* Gross Merchandise Value */}
        <div className="kpi-card">
          <label className="kpi-label">Gross Volume (GMV)</label>
          <p className="kpi-value">${stats.gmv.toFixed(2)}</p>
          <span className="kpi-meta">Total processed payments</span>
        </div>

        {/* Platform Revenue - The 15% Cut */}
        <div className="kpi-card highlight">
          <label className="kpi-label">Platform Revenue (15%)</label>
          <p className="kpi-value">${stats.revenue.toFixed(2)}</p>
          <span className="kpi-meta">Net Lernitt earnings</span>
        </div>

        {/* Current Liability - Money owed to all tutors */}
        <div className="kpi-card warning">
          <label className="kpi-label">Current Liability</label>
          <p className="kpi-value">${stats.liability.toFixed(2)}</p>
          <span className="kpi-meta">Total funds held in tutor balances</span>
        </div>
      </div>

      <style jsx>{`
        .admin-wrapper {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .admin-header {
          margin-bottom: 48px;
          border-bottom: 5px solid #000;
          padding-bottom: 20px;
        }
        .admin-title {
          font-size: 42px;
          font-weight: 900;
          text-transform: uppercase;
          italic: true;
          margin: 0;
          letter-spacing: -2px;
        }
        .admin-subtitle {
          font-size: 14px;
          font-weight: bold;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .kpi-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }
        .kpi-card {
          background: #fff;
          border: 4px solid #000;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 12px 12px 0px 0px rgba(0,0,0,1);
        }
        .kpi-card.highlight { background-color: #facc15; }
        .kpi-card.warning { background-color: #fee2e2; }
        .kpi-label {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          color: #000;
          opacity: 0.5;
          display: block;
          margin-bottom: 8px;
        }
        .kpi-value {
          font-size: 54px;
          font-weight: 900;
          margin: 0;
          letter-spacing: -3px;
        }
        .warning .kpi-value { color: #dc2626; }
        .kpi-meta {
          font-size: 11px;
          font-weight: bold;
          color: #666;
          text-transform: uppercase;
          margin-top: 12px;
          display: block;
        }
      `}</style>
    </div>
  );
}
