// src/app/marketplace/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styles from './marketplace.module.css';

// Fixes the red lines by telling the computer exactly what a Tutor object contains
interface Tutor {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
  hourlyRate: number;
  tutorType: string;
  subjects: { name: string }[];
}

export default function StudentMarketplace() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    async function loadMarketplace() {
      try {
        const res = await fetch('/api/marketplace_data');
        const data = await res.json();
        setTutors(data);
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
      (t.subjects && t.subjects.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesType = filterType === 'all' || t.tutorType === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) return <div className={styles.container}>Loading Marketplace...</div>;

  return (
    <div className={styles.container}>
      <h1 className="text-3xl font-black mb-8">Find Your Tutor</h1>
      
      {/* Search and Filters */}
      <div className="flex gap-4 mb-8">
        <input 
          className="border p-4 rounded-2xl w-full"
          placeholder="Search by name or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="border p-4 rounded-2xl"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="professional">Professional</option>
          <option value="community">Community</option>
        </select>
      </div>

      {/* Tutor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutors.map(tutor => (
          <div key={tutor._id} className="border p-6 rounded-[32px] bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
              <div>
                <h3 className="font-bold text-xl">{tutor.name}</h3>
                <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  {tutor.tutorType}
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-sm line-clamp-3 mb-4">{tutor.bio}</p>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="font-black text-lg">${tutor.hourlyRate}/hr</span>
              <button className="bg-black text-white px-6 py-2 rounded-xl font-bold text-sm">View Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
