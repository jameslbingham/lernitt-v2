'use client';

import React, { useState } from 'react';
import styles from '../profile.module.css';

export default function AdvancedProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Bob Tutor',
    type: 'professional', // professional or community
    videoUrl: '', //
    subjects: [
      { name: 'Business English', rate: 120, discount5: 10 }, //
      { name: 'General Conversation', rate: 80, discount5: 5 }
    ],
    payoutMethod: 'paypal',
    paypalEmail: 'bob_payouts@example.com'
  });

  const [saving, setSaving] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 style={{fontSize: '32px', fontWeight: 900, marginBottom: '40px'}}>Marketplace Profile</h1>

        {/* Tutor Type Selection */}
        <div className={styles.section}>
          <label className={styles.label}>Account Type</label>
          <div className={styles.typeToggle}>
            <button 
              className={`${styles.toggleBtn} ${profile.type === 'professional' ? styles.activeToggle : ''}`}
              onClick={() => setProfile({...profile, type: 'professional'})}
            >
              Professional Tutor
            </button>
            <button 
              className={`${styles.toggleBtn} ${profile.type === 'community' ? styles.activeToggle : ''}`}
              onClick={() => setProfile({...profile, type: 'community'})}
            >
              Community Tutor
            </button>
          </div>
        </div>

        {/* Video Upload Section */}
        <div className={styles.section}>
          <label className={styles.label}>Introduction Video</label>
          <div className={styles.videoBox}>
            <span style={{fontSize: '40px'}}>🎥</span>
            <p>Click to upload your introduction video</p>
            <span style={{fontSize: '12px'}}>MP4 or MOV preferred</span>
          </div>
        </div>

        {/* Subject & Tiered Pricing */}
        <div className={styles.section}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
            <label className={styles.label}>Subjects & Tiered Pricing</label>
            <button style={{background: 'none', border: 'none', color: '#2563eb', fontWeight: 800}}>+ Add Subject</button>
          </div>
          <div className={styles.priceGrid}>
            <span className={styles.label} style={{fontSize: '10px'}}>Subject</span>
            <span className={styles.label} style={{fontSize: '10px'}}>Hourly Rate ($)</span>
            <span className={styles.label} style={{fontSize: '10px'}}>5-Lesson Discount (%)</span>
          </div>
          {profile.subjects.map((sub, idx) => (
            <div key={idx} className={styles.priceGrid}>
              <input className={styles.input} value={sub.name} readOnly />
              <input className={styles.input} type="number" value={sub.rate} />
              <input className={styles.input} type="number" value={sub.discount5} />
            </div>
          ))}
        </div>

        {/* Payout Preferences */}
        <div className={styles.section}>
          <label className={styles.label}>Withdrawal Method</label>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              className={`${styles.toggleBtn} ${profile.payoutMethod === 'stripe' ? styles.activeToggle : ''}`}
              style={{border: '1px solid #e2e8f0'}}
              onClick={() => setProfile({...profile, payoutMethod: 'stripe'})}
            >
              🏦 Stripe
            </button>
            <button 
              className={`${styles.toggleBtn} ${profile.payoutMethod === 'paypal' ? styles.activeToggle : ''}`}
              style={{border: '1px solid #e2e8f0'}}
              onClick={() => setProfile({...profile, payoutMethod: 'paypal'})}
            >
              💳 PayPal
            </button>
          </div>
        </div>

        <button className={styles.saveBtn} onClick={() => alert("Profile Saved!")}>
          Save Professional Profile
        </button>
      </div>
    </div>
  );
}
