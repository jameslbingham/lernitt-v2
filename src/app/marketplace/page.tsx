'use client';

import React, { useState, useEffect } from 'react';
import styles from '../marketplace.module.css';

export default function StudentMarketplace() {
  const [tutors, setTutors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, professional, community
  const [loading, setLoading] = useState(true);

  // Load tutors who are "Approved" (V1 Logic)
  useEffect(() => {
    async function loadMarketplace() {
      try {
        const res = await fetch('/api/marketplace_data');
        const data = await res.json();
        setTutors(data.tutors || []);
      } catch (e) {
        console.error("Marketplace Load Error");
      } finally {
        setLoading(false);
      }
    }
    loadMarketplace();
  }, []);

  // AI-Style Filtering: Searches Name, Bio, and Subjects
  const filteredTutors = tutors.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjects?.some((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || t.tutorType === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) return <div className={styles.container}>Loading Tutors...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <h1 style={{fontSize: '42px', fontWeight: 900, letterSpacing: '-0.02em', margin: 0}}>Find Your Teacher</h1>
        <p style={{color: '#64748b', fontSize: '18px', marginTop: '10px'}}>Search by subject, level, or professional status.</p>

        {/* Search & Filter Bar */}
        <div className={styles.filterBar}>
          <input 
            className={styles.filterInput} 
            placeholder="What do you want to learn? (e.g. Business English)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className={styles.filterInput} 
            style={{flex: 0.4}}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Tutor Types</option>
            <option value="professional">Professional Tutors</option>
            <option value="community">Community Tutors</option>
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredTutors.map((tutor: any) => (
          <div key={tutor._id} className={styles.tutorCard}>
            <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
              <div className={styles.avatar}>👨‍🏫</div>
              <div style={{textAlign: 'left'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <h2 style={{fontSize: '22px', fontWeight: 900, margin: 0}}>{tutor.name}</h2>
                  {tutor.tutorType === 'professional' && <span title="Verified Professional" style={{fontSize: '18px'}}>💎</span>}
                </div>
                <span className={styles.badge} style={{
                  backgroundColor: tutor.tutorType === 'professional' ? '#eff6ff' : '#f8fafc',
                  color: tutor.tutorType === 'professional' ? '#2563eb' : '#64748b'
                }}>
                  {tutor.tutorType === 'professional' ? 'Professional' : 'Community'}
                </span>
              </div>
            </div>

            {/* Video Preview Badge */}
            {tutor.videoUrl && (
              <div style={{backgroundColor: '#000', borderRadius: '12px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', cursor: 'pointer'}}>
                <span style={{color: 'white', fontWeight: 800}}>▶ Watch Intro Video</span>
              </div>
            )}

            <p style={{fontSize: '14px', color: '#475569', height: '60px', overflow: 'hidden', marginBottom: '20px'}}>
              {tutor.bio || "No bio provided."}
            </p>

            {/* Tiered Pricing List */}
            <div style={{borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginBottom: '20px'}}>
              <p className={styles.label} style={{fontSize: '10px'}}>Lesson Rates</p>
              {tutor.subjects?.map((s: any, i: number) => (
                <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '6px'}}>
                  <span style={{fontSize: '13px', fontWeight: 700}}>{s.name}</span>
                  <div style={{textAlign: 'right'}}>
                    <span style={{fontSize: '14px', fontWeight: 900}}>${s.rate}</span>
                    {s.discount5 > 0 && <span style={{fontSize: '10px', color: '#16a34a', marginLeft: '5px'}}>-{s.discount5}% for 5</span>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              {/* Contact Tutor Button (V1 Messaging Hook) */}
              <button 
                className={styles.bookBtn} 
                style={{backgroundColor: '#f1f5f9', color: '#0f172a', flex: 1}}
                onClick={() => alert(`Opening chat with ${tutor.name}...`)}
              >
                Message
              </button>
              <button 
                className={styles.bookBtn} 
                style={{flex: 2}}
                onClick={() => alert("Opening SlotPicker...")}
              >
                Book Lesson
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
