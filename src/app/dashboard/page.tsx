// src/app/dashboard/page.tsx
import React from 'react';
import styles from './dashboard.module.css';
import clientPromise from '../../lib/mongodb';
// Fixed relative path to reach src/components/dashboard/StatusBanner
import StatusBanner from '../../components/dashboard/StatusBanner';

async function getDashboardData() {
  try {
    const client = await clientPromise;
    const db = client.db("lernitt_v2");
    
    // Fetch tutor record for the status banner
    const bob = await db.collection("users").findOne({ role: 'tutor' });

    const lessons = await db.collection("lessons")
      .find({})
      .sort({ date: -1 })
      .limit(10)
      .toArray();
    
    return {
      lessons: JSON.parse(JSON.stringify(lessons)),
      status: bob?.tutorStatus || 'none'
    };
  } catch (e) {
    console.error("Dashboard Data Error:", e);
    return { lessons: [], status: 'none' };
  }
}

export default async function TutorDashboard() {
  const { lessons, status } = await getDashboardData();
  
  const totalNet = lessons.reduce((sum: number, l: any) => sum + (Number(l.netAmount) || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        <div className={styles.header}>
          <div style={{textAlign: 'left'}}>
            <h1 style={{fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0}}>Dashboard</h1>
            <p style={{color: '#64748b', fontSize: '18px', fontWeight: '500', marginTop: '8px'}}>Live Database View • Bob Tutor Account</p>
          </div>
          <button className={styles.withdrawBtn}>Withdraw Earnings</button>
        </div>

        {/* Displaying the custom notification banner */}
        <StatusBanner status={status} />

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div style={{fontSize: '28px', marginBottom: '20px'}}>💰</div>
            <p style={{fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase'}}>Available for Payout</p>
            <h3 style={{fontSize: '32px', fontWeight: '900'}}>${totalNet.toFixed(2)}</h3>
          </div>
        </div>

        {/* Lessons Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Student</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th} style={{textAlign: 'right'}}>Payout</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson: any) => (
                <tr key={lesson._id}>
                  <td className={styles.td}>{lesson.studentName}</td>
                  <td className={styles.td}>{new Date(lesson.date).toLocaleDateString()}</td>
                  <td className={styles.td} style={{textAlign: 'right'}}>${Number(lesson.netAmount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
