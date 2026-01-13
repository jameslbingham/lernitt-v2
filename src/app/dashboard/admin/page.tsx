'use client';
import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load tutors from the GET API
  const loadTutors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/tutors');
      const data = await res.json();
      setTutors(data.tutors || []);
    } catch (err) {
      console.error("Failed to load tutors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTutors(); }, []);

  const handleAction = async (tutorId: string, status: string) => {
    try {
      // Logic aligned with your PATCH API
      const res = await fetch('/api/admin/tutor-approval', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId, status })
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
        return;
      }

      // Refresh list after successful status change [cite: 2026-01-13]
      await loadTutors(); 
    } catch (err) {
      alert("System communication error. Check terminal.");
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading pending tutors...</div>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'left', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontWeight: 900, fontSize: '38px', margin: 0 }}>Admin Approval Panel</h1>
        <p style={{ color: '#64748b', fontSize: '18px' }}>Manage tutor visibility in the marketplace.</p>
      </header>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {tutors.length === 0 ? (
          <div style={{ padding: '60px', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
            <p style={{ fontWeight: 700, color: '#94a3b8' }}>No tutors currently waiting for approval.</p>
          </div>
        ) : tutors.map((t: any) => (
          <div key={t._id} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: '20px' }}>{t.name}</h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>{t.email}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handleAction(t._id, 'approved')} 
                style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}
              >
                Approve
              </button>
              <button 
                onClick={() => handleAction(t._id, 'rejected')} 
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}
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
