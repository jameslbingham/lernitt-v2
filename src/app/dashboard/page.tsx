// src/app/dashboard/page.tsx
import React from 'react';
import styles from './dashboard.module.css';
import clientPromise from '../../lib/mongodb';
import StatusBanner from '../../components/dashboard/StatusBanner';

async function getDashboardData() {
  try {
    const client = await clientPromise;
    // Standardized on 'lernitt_v2' to match your setup
    const db = client.db("lernitt_v2");
    
    // 1. Fetch Bob's specific tutor record to check his status
    const bob = await db.collection("users").findOne({ role: 'tutor' });

    // 2. Fetch Recent Lessons for the table
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
    console.error("Database Error:", e);
    return { lessons: [], status: 'none' };
  }
}

export default async function TutorDashboard() {
  const { lessons, status } = await getDashboardData();
  
  // Financial math for the cards
  const totalGross = lessons.reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0);
  const totalNet = lessons.reduce((sum: number, l: any) => sum + (Number(l.netAmount) || 0), 0);
  const platformFees = totalGross - totalNet;

  const stats = [
    { label: 'Available for Payout', value: `$${totalNet.toFixed(2)}`, icon: '💰' },
    { label: 'Lessons Completed', value: lessons.length.toString(), icon: '✅' },
    { label: 'Avg. Net Payout', value: `$${(totalNet / (lessons.length || 1)).toFixed(2)}`, icon: '💵' },
    { label: 'Platform Fees (15%)', value: `$${platformFees.toFixed(2)}`, icon: '📉' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Header Section */}
        <div className={styles.header}>
          <div style={{textAlign: 'left'}}>
            <h1 style={{fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0}}>Dashboard</h1>
            <p style={{color: '#64748b', fontSize: '18px', fontWeight: '500', marginTop: '8px'}}>Live Database View • Bob Tutor Account</p>
          </div>
          <button className={styles.withdrawBtn}>Withdraw Earnings</button>
        </div>

        {/* DAY 5 NOTIFICATION BANNER: Tells Bob if he is Approved or Pending */}
        <StatusBanner status={status} />

        {/* Financial Cards */}
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <div style={{fontSize: '28px', marginBottom: '20px'}}>{stat.icon}</div>
              <p style={{fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px'}}>{stat.label}</p>
              <h3 style={{fontSize: '32px', fontWeight: '900', margin: '10px 0 0 0'}}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Lessons Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2 style={{fontSize: '24px', fontWeight: '900', margin: 0}}>Recent Lessons</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Student & Action</th>
                <th className={styles.th} style={{textAlign: 'center'}}>Date</th>
                <th className={styles.th} style={{textAlign: 'right'}}>Gross Price</th>
                <th className={styles.th} style={{textAlign: 'right'}}>Your Payout</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length > 0 ? (
                lessons.map((lesson: any) => (
                  <tr key={lesson._id}>
                    <td className={styles.td}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                          <div style={{width: '44px', height: '44px', backgroundColor: '#f1f5f9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#64748b', marginRight: '14px'}}>
                            {lesson.studentName?.charAt(0) || 'S'}
                          </div>
                          <div style={{textAlign: 'left'}}>
                            <div style={{fontWeight: '800', fontSize: '16px'}}>{lesson.studentName}</div>
                            <div style={{fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>{lesson.subject || 'English Lesson'}</div>
                          </div>
                        </div>
                        <a 
                          href={lesson.videoLink || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '900',
                            textDecoration: 'none'
                          }}
                        >
                          START
                        </a>
                      </div>
                    </td>
                    <td className={styles.td} style={{textAlign: 'center', color: '#64748b', fontWeight: '600'}}>
                      {new Date(lesson.date).toLocaleDateString()}
                    </td>
                    <td className={styles.td} style={{textAlign: 'right'}}>${Number(lesson.amount).toFixed(2)}</td>
                    <td className={styles.td} style={{textAlign: 'right', fontWeight: '700', color: '#10b981'}}>
                      ${Number(lesson.netAmount).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>
                    No lessons found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
