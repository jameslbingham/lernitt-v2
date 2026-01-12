'use client';

import React, { useState } from 'react';
import styles from '../profile.module.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Bob Tutor',
    subjects: 'English, Business English, IELTS Prep',
    hourlyRate: 100,
    bio: 'I am a senior English tutor with over 10 years of experience helping students achieve fluency.',
    payoutMethod: 'stripe',
    paypalEmail: '',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Mimic API delay for V2 demo
    setTimeout(() => {
      alert(`Success! Profile updated for ${profile.name}. Payouts set to ${profile.payoutMethod.toUpperCase()}.`);
      setSaving(false);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{textAlign: 'left', marginBottom: '40px'}}>
          <h1 style={{fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0}}>Public Profile</h1>
          <p style={{color: '#64748b', fontSize: '18px', fontWeight: '500', marginTop: '8px'}}>Control how students see you and how you get paid.</p>
        </div>

        <div className={styles.avatarContainer}>
          <div className={styles.avatarCircle}>👨‍🏫</div>
          <div style={{textAlign: 'left'}}>
            <span className={styles.label}>Profile Picture</span>
            <button style={{background: 'none', border: 'none', color: '#2563eb', fontWeight: '800', cursor: 'pointer', padding: 0, fontSize: '14px'}}>Upload new photo</button>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div style={{textAlign: 'left'}}>
            <label className={styles.label}>Full Name</label>
            <input className={styles.input} value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
          </div>
          <div style={{textAlign: 'left'}}>
            <label className={styles.label}>Hourly Rate (USD)</label>
            <input className={styles.input} type="number" value={profile.hourlyRate} onChange={(e) => setProfile({...profile, hourlyRate: Number(e.target.value)})} />
          </div>
        </div>

        <div style={{textAlign: 'left'}}>
          <label className={styles.label}>Subjects (Comma Separated)</label>
          <input className={styles.input} value={profile.subjects} onChange={(e) => setProfile({...profile, subjects: e.target.value})} />
        </div>

        <div style={{textAlign: 'left'}}>
          <label className={styles.label}>Professional Bio</label>
          <textarea className={styles.textarea} rows={4} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
        </div>

        <div style={{textAlign: 'left', marginTop: '20px'}}>
          <label className={styles.label}>Withdrawal Method</label>
          <div className={styles.methodToggle}>
            <button 
              className={`${styles.methodBtn} ${profile.payoutMethod === 'stripe' ? styles.methodActive : ''}`}
              onClick={() => setProfile({...profile, payoutMethod: 'stripe'})}
            >
              <span style={{fontSize: '24px'}}>🏦</span>
              <span>Stripe (Bank)</span>
            </button>
            <button 
              className={`${styles.methodBtn} ${profile.payoutMethod === 'paypal' ? styles.methodActive : ''}`}
              onClick={() => setProfile({...profile, payoutMethod: 'paypal'})}
            >
              <span style={{fontSize: '24px'}}>💳</span>
              <span>PayPal</span>
            </button>
          </div>
        </div>

        {profile.payoutMethod === 'paypal' && (
          <div style={{textAlign: 'left'}}>
            <label className={styles.label}>PayPal Email Address</label>
            <input 
              className={styles.input} 
              placeholder="paypal-email@example.com"
              value={profile.paypalEmail} 
              onChange={(e) => setProfile({...profile, paypalEmail: e.target.value})} 
            />
          </div>
        )}

        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Updating Profile...' : 'Save Profile Changes'}
        </button>
      </div>
    </div>
  );
}
