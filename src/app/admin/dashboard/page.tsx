// @ts-nocheck
import React from 'react';
import clientPromise from '../../../lib/database/mongodb';

/**
 * We are using direct MongoDB calls here to avoid any intermediate 
 * API layers that might trigger the SWC binary error on older hardware.
 */
async function getAdminStats() {
  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");

    // Standard 15% platform fee logic
    const COMMISSION_RATE = 0.15;

    // Aggregate data directly from collections
    const payments = await db.collection("payments").find({ status: "succeeded" }).toArray();
    const liabilityData = await db.collection("users").find({ role: "tutor" }).toArray();

    const gmv = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const liability = liabilityData.reduce((acc, curr) => acc + (curr.totalEarnings || 0), 0);
    const revenue = gmv * COMMISSION_RATE;

    return { gmv, revenue, liability };
  } catch (err) {
    console.error("Dashboard DB Error:", err);
    return { gmv: 0, revenue: 0, liability: 0 };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px', borderBottom: '5px solid #000', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
          Marketplace Revenue
        </h1>
        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>
          Hardware-Safe Admin View
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        <div style={{ background: '#fff', border: '4px solid #000', borderRadius: '24px', padding: '32px', boxShadow: '12px 12px 0px 0px #000' }}>
          <label style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', opacity: 0.5 }}>Gross Volume</label>
          <p style={{ fontSize: '54px', fontWeight: '900', margin: 0 }}>${stats.gmv.toFixed(2)}</p>
        </div>

        <div style={{ background: '#facc15', border: '4px solid #000', borderRadius: '24px', padding: '32px', boxShadow: '12px 12px 0px 0px #000' }}>
          <label style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', opacity: 0.5 }}>Platform Fee (15%)</label>
          <p style={{ fontSize: '54px', fontWeight: '900', margin: 0 }}>${stats.revenue.toFixed(2)}</p>
        </div>

        <div style={{ background: '#fee2e2', border: '4px solid #000', borderRadius: '24px', padding: '32px', boxShadow: '12px 12px 0px 0px #000' }}>
          <label style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', opacity: 0.5 }}>Tutor Liability</label>
          <p style={{ fontSize: '54px', fontWeight: '900', margin: 0, color: '#dc2626' }}>${stats.liability.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
