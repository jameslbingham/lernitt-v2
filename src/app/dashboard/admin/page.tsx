'use client';
import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [tutors, setTutors] = useState([]);

  const loadTutors = async () => {
    const res = await fetch('/api/admin/tutors');
    const data = await res.json();
    setTutors(data.tutors || []);
  };

  useEffect(() => { loadTutors(); }, []);

  const handleAction = async (tutorId: string, status: string) => {
    // This talks to your existing tutor-approval/route.ts file
    await fetch('/api/admin/tutor-approval', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutorId, status })
    });
    loadTutors(); // Refresh the list after approval
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'left' }}>
      <h1 style={{ fontWeight: 900, fontSize: '32px' }}>Admin: Pending Approvals</h1>
      <p style={{ color: '#64748b' }}>Review tutor applications for quality control.</p>
      
      <div style={{ marginTop: '30px' }}>
        {tutors.length === 0 ? (
          <div style={{ padding: '40px', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
            No tutors currently waiting for approval.
          </div>
        ) : tutors.map((t: any) => (
          <div key={t._id} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 900, fontSize: '18px', margin: 0 }}>{t.name}</p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>{t.email}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleAction(t._id, 'approved')} 
                style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Approve
              </button>
              <button 
                onClick={() => handleAction(t._id, 'rejected')} 
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
