'use client';

import React, { useState, useEffect } from 'react';
import styles from '../profile.module.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Bob Tutor',
    email: 'bob_tutor@example.com',
    subjects: 'English, Business English',
    hourlyRate: 100,
    bio: 'Senior English tutor with 10 years experience.',
    payoutMethod: 'stripe',
    paypalEmail: '',
  });

  const [saving, setSaving] = useState(false);

  // Auto-load Bob's existing settings from MongoDB on mount
  useEffect(() => {
    async function loadProfile() {
      const res = await fetch('/api/profile_data'); // We'll create this next
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({ ...prev, ...data }));
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile_update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) alert("Profile Updated Successfully!");
    } catch (e) {
      alert("Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 style={{fontSize: '32px', fontWeight: 900, marginBottom: '8px'}}>Tutor Profile</h1>
        <p style={{color: '#64748b', marginBottom: '40px'}}>Manage your teaching details and payout methods.</p>

        {/* Avatar Section */}
        <div className={styles.avatarContainer}>
          <div className={styles.avatarCircle}>👨‍🏫</div>
          <div>
            <span className={styles.label}>Profile Image</span>
            <button style={{color: '#2563eb', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer'}}>Upload New Photo</button>
          </div>
        </div>

        {/* Basic Info */}
        <div className={styles.row}>
          <div className={styles.section}>
            <label className={styles.label}>Full Name</label>
            <input className={styles.input} value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
          </div>
          <div className={styles.section}>
            <label className={styles.label}>Hourly Rate (USD)</label>
            <input className={styles.input} type="number" value={profile.hourlyRate} onChange={(e) => setProfile({...profile, hourlyRate: Number(e.target.value)})} />
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Subjects (Comma Separated)</label>
          <input className={styles.input} value={profile.subjects} onChange={(e) => setProfile({...profile, subjects: e.target.value})} />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Professional Bio</label>
          <textarea className={styles.textarea} rows={4} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
        </div>

        <hr style={{border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0 40px 0'}} />

        {/* Payout Method */}
        <div className={styles.section}>
          <label className={styles.label}>Withdrawal Method</label>
          <div className={styles.methodToggle}>
            <button 
              className={`${styles.methodBtn} ${profile.payoutMethod === 'stripe' ? styles.methodActive : ''}`}
              onClick={() => setProfile({...profile, payoutMethod: 'stripe'})}
            >
              🏦 Stripe (Bank)
            </button>
            <button 
              className={`${styles.methodBtn} ${profile.payoutMethod === 'paypal' ? styles.methodActive : ''}`}
              onClick={() => setProfile({...profile, payoutMethod: 'paypal'})}
            >
              💳 PayPal
            </button>
          </div>
        </div>

        {profile.payoutMethod === 'paypal' && (
          <div className={styles.section}>
            <label className={styles.label}>PayPal Email Address</label>
            <input 
              className={styles.input} 
              placeholder="your-paypal@example.com"
              value={profile.paypalEmail} 
              onChange={(e) => setProfile({...profile, paypalEmail: e.target.value})} 
            />
          </div>
        )}

        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>
    </div>
  );
}
