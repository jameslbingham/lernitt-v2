'use client';

import React, { useState, useEffect } from 'react';
// Fixed path: now looks in the same folder for the CSS file
import styles from './marketplace.module.css';

export default function StudentMarketplace() {
  const [tutors, setTutors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarketplace() {
      try {
        const res = await fetch('/api/marketplace_data');
        const data = await res.json();
        setTutors(data.tutors || []);
      } catch (e) {
        console.error("Marketplace API Error");
      } finally {
        setLoading(false);
      }
    }
    loadMarketplace();
  }, []);

  const filteredTutors = tutors.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjects?.some((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || t.tutorType === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) return <div className={styles.container}>Loading Marketplace...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <h1 style={{fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', margin: 0}}>Find a Teacher</h1>
        <p style={{color: '#64748b', fontSize: '20px', marginTop: '12px', fontWeight: '500'}}>Choose between Professional and Community tutors.</p>

        <div className={styles.filterBar}>
          <input 
            className={styles.filterInput} 
            placeholder="Search by subject (e.g. Business English)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className={styles.filterInput} 
            style={{flex: 0.4}}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Tutors</option>
            <option value="professional">Professional Tutors 💎</option>
            <option value="community">Community Tutors 🏠</option>
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredTutors.map((tutor: any) => (
          <div key={tutor._id} className={styles.tutorCard}>
            <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
              <div className={styles.avatar}>👨‍🏫</div>
              <div style={{textAlign: 'left'}}>
                <h2 style={{fontSize: '24px', fontWeight: 900, margin: 0}}>{tutor.name}</h2>
                <span className={styles.badge} style={{
                  backgroundColor: tutor.tutorType === 'professional' ? '#eff6ff' : '#f8fafc',
                  color: tutor.tutorType === 'professional' ? '#2563eb' : '#64748b'
                }}>
                  {tutor.tutorType === 'professional' ? 'Professional' : 'Community'}
                </span>
              </div>
            </div>

            <p style={{fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '20px 0', height: '72px', overflow: 'hidden'}}>
              {tutor.bio || "Hello! I am a dedicated tutor here to help you achieve your learning goals."}
            </p>

            <div style={{marginBottom: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '15px'}}>
              <p style={{fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px'}}>Lesson Rates</p>
              {tutor.subjects?.map((s: any, i: number) => (
                <div key={i} className={styles.priceItem}>
                  <span style={{fontWeight: 700, fontSize: '14px'}}>{s.name}</span>
                  <div style={{textAlign: 'right'}}>
                    <span style={{fontWeight: 900, fontSize: '15px'}}>${s.rate}</span>
                    {s.discount5 > 0 && <span style={{fontSize: '11px', color: '#16a34a', marginLeft: '6px'}}>(-{s.discount5}%)</span>}
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.bookBtn} onClick={() => alert("Booking calendar opening...")}>
              Book a Lesson
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
