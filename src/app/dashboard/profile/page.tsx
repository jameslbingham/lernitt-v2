'use client';

import React, { useState, useEffect } from 'react';
import styles from '../profile.module.css';

export default function AdvancedProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Bob Tutor',
    tutorType: 'professional', //
    tutorStatus: 'approved',   // Merged from V1
    videoUrl: '',              //
    bio: '',
    subjects: [
      { name: 'Business English', rate: 120, discount5: 10 }, //
      { name: 'General Conversation', rate: 80, discount5: 5 }
    ],
    payoutMethod: 'stripe',
    paypalEmail: '',           //
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch('/api/profile_data');
      if (res.ok) {
        const data = await res.json();
        if (data.name) setProfile(prev => ({ ...prev, ...data }));
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
      if (res.ok) alert("italki-style Professional Profile Saved!");
    } catch (e) {
      alert("Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <h1 style={{fontSize: '32px', fontWeight: 900, margin: 0}}>Tutor Profile</h1>
          <span style={{
            backgroundColor: profile.tutorStatus === 'approved' ? '#f0fdf4' : '#fff7ed',
            color: profile.tutorStatus === 'approved' ? '#16a34a' : '#ea580c',
            padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase'
          }}>
            Status: {profile.tutorStatus}
          </span>
        </div>

        {/* Section: Professional vs Community */}
        <div className={styles.section}>
          <label className={styles.label}>Teaching Tier</label>
          <div className={styles.typeToggle}>
            <button 
              className={`${styles.toggleBtn} ${profile.tutorType === 'professional' ? styles.activeToggle : ''}`}
              onClick={() => setProfile({...profile, tutorType: 'professional'})}
            >
              Professional (Qualified)
            </button>
            <button 
              className={`${styles.toggleBtn} ${profile.tutorType === 'community' ? styles.activeToggle : ''}`}
              onClick={() => setProfile({...profile, tutorType: 'community'})}
            >
              Community (Native Speaker)
            </button>
          </div>
        </div>

        {/* Section: Intro Video */}
        <div className={styles.section}>
          <label className={styles.label}>Intro Video URL (YouTube/Vimeo)</label>
          <input 
            className={styles.input} 
            placeholder="https://www.youtube.com/watch?v=..." 
            value={profile.videoUrl}
            onChange={(e) => setProfile({...profile, videoUrl: e.target.value})}
          />
          {profile.videoUrl && (
            <div className={styles.videoBox} style={{marginTop: '15px', borderStyle: 'solid', borderColor: '#e2e8f0'}}>
              <span style={{fontSize: '14px'}}>Video Link Connected ✅</span>
            </div>
          )}
        </div>

        {/* Section: Bio */}
        <div className={styles.section}>
          <label className={styles.label}>Professional Bio</label>
          <textarea 
            className={styles.textarea} 
            rows={4} 
            value={profile.bio}
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
            placeholder="Describe your experience..."
          />
        </div>

        {/* Section: Tiered Pricing & Discounts */}
        <div className={styles.section}>
          <label className={styles.label}>Subject Pricing & Bundles</label>
          <div className={styles.priceGrid} style={{marginBottom: '5px', opacity: 0.6}}>
            <span style={{fontSize: '10px', fontWeight: 900}}>SUBJECT</span>
            <span style={{fontSize: '10px', fontWeight: 900}}>RATE ($)</span>
            <span style={{fontSize: '10px', fontWeight: 900}}>5-LESSON DISCOUNT (%)</span>
          </div>
          {profile.subjects.map((sub, idx) => (
            <div key={idx} className={styles.priceGrid} style={{marginBottom: '10px'}}>
              <input className={styles.input} value={sub.name} readOnly />
              <input 
                className={styles.input} 
                type="number" 
                value={sub.rate} 
                onChange={(e) => {
                  const newSubs = [...profile.subjects];
                  newSubs[idx].rate = Number(e.target.value);
                  setProfile({...profile, subjects: newSubs});
                }}
              />
              <input 
                className={styles.input} 
                type="number" 
                value={sub.discount5} 
                onChange={(e) => {
                  const newSubs = [...profile.subjects];
                  newSubs[idx].discount5 = Number(e.target.value);
                  setProfile({...profile, subjects: newSubs});
                }}
              />
            </div>
          ))}
        </div>

        {/* Section: Payout Preference */}
        <div className={styles.section}>
          <label className={styles.label}>Withdrawal Method</label>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              className={`${styles.methodBtn} ${profile.payoutMethod === 'stripe' ? styles.methodActive : ''}`}
              onClick={() => setProfile({...profile, payoutMethod: 'stripe'})}
            >
              🏦 Stripe
            </button>
            <button 
              className={`${styles.methodBtn} ${profile.payoutMethod === 'paypal' ? styles.methodActive : ''}`}
              onClick={() => setProfile({...profile, payoutMethod: 'paypal'})}
            >
              💳 PayPal
            </button>
          </div>
          {profile.payoutMethod === 'paypal' && (
            <input 
              className={styles.input} 
              style={{marginTop: '15px'}} 
              placeholder="PayPal Email Address" 
              value={profile.paypalEmail}
              onChange={(e) => setProfile({...profile, paypalEmail: e.target.value})}
            />
          )}
        </div>

        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Syncing with Database...' : 'Save Professional Profile'}
        </button>
      </div>
    </div>
  );
}
