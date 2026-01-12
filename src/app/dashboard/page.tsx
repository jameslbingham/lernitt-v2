import React from 'react';
import styles from './dashboard.module.css';
import clientPromise from '../../lib/mongodb';

async function getLessons() {
  try {
    const client = await clientPromise;
    const db = client.db("lernitt_v2");
    
    const lessons = await db.collection("lessons")
      .find({})
      .sort({ date: -1 })
      .limit(10)
      .toArray();
    
    return JSON.parse(JSON.stringify(lessons));
  } catch (e) {
    console.error("Database Error:", e);
    return [];
  }
}

export default async function TutorDashboard() {
  const lessons = await getLessons();
  
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
        
        <div className={styles.header}>
          <div style={{textAlign: 'left'}}>
            <h1 style={{fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0}}>Dashboard</h1>
            <p style={{color: '#64748b', fontSize: '18px', fontWeight: '500', marginTop: '8px'}}>Live Database View • Bob Tutor Account</p>
          </div>
          <button className={styles.withdrawBtn}>Withdraw Earnings</button>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <div style={{fontSize: '28px', marginBottom: '20px'}}>{stat.icon}</div>
              <p style={{fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px'}}>{stat.label}</p>
              <h3 style={{fontSize: '32px', fontWeight: '900', margin: '10px 0 0 0'}}>{stat.value}</h3>
            </div>
          ))}
        </div>

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
              {lessons.map((lesson: any) => (
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
                      {/* ACTION BUTTON */}
                      <button style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '900',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                      }}>
                        START LESSON
                      </button>
                    </div>
                  </td>
                  <td className={styles.td} style={{textAlign: 'center', color: '#64748b', fontWeight: '600'}}>
                    {new Date(lesson.date).toLocaleDateString()}
                  </td>
                  <td className={styles.td} style={{textAlign: 'right', fontWeight: '700'}}>${Number(lesson.amount).toFixed(2)}</td>
                  <td className={styles.td} style={{textAlign: 'right'}}>
                    <span className={styles.payoutText}>${Number(lesson.netAmount).toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
