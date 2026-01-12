import React from 'react';
import styles from './dashboard.module.css';
import clientPromise from '@/lib/mongodb';

async function getLessons() {
  try {
    const client = await clientPromise;
    const db = client.db("lernitt-v2");
    // Fetch the 5 lessons you seeded
    const lessons = await db.collection("lessons")
      .find({})
      .sort({ date: -1 })
      .limit(10)
      .toArray();
    
    return JSON.parse(JSON.stringify(lessons));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function TutorDashboard() {
  const lessons = await getLessons();
  
  // Calculate real totals based on the database data
  const totalGross = lessons.reduce((sum: number, l: any) => sum + (l.price || 0), 0);
  const totalNet = lessons.reduce((sum: number, l: any) => sum + (l.netPayout || 0), 0);
  const platformFees = totalGross - totalNet;

  const stats = [
    { label: 'Available for Payout', value: `$${totalNet.toFixed(2)}`, icon: '💰', bg: 'bg-blue-50' },
    { label: 'Lessons Completed', value: lessons.length.toString(), icon: '✅', bg: 'bg-green-50' },
    { label: 'Avg. Net Payout', value: `$${(totalNet / (lessons.length || 1)).toFixed(2)}`, icon: '💵', bg: 'bg-purple-50' },
    { label: 'Platform Fees (15%)', value: `$${platformFees.toFixed(2)}`, icon: '📉', bg: 'bg-orange-50' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        <div className={styles.header}>
          <div>
            <h1 style={{fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em'}}>Dashboard</h1>
            <p style={{color: '#64748b', fontSize: '18px', fontWeight: '500'}}>Live Database View • Bob Tutor</p>
          </div>
          <button className={styles.withdrawBtn}>Withdraw Earnings</button>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <div style={{fontSize: '28px', marginBottom: '20px'}}>{stat.icon}</div>
              <p style={{fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase'}}>{stat.label}</p>
              <h3 style={{fontSize: '32px', fontWeight: '900', margin: '10px 0 0 0'}}>{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2 style={{fontSize: '24px', fontWeight: '900'}}>Recent Lessons</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Student</th>
                <th className={styles.th} style={{textAlign: 'center'}}>Date</th>
                <th className={styles.th} style={{textAlign: 'right'}}>Gross</th>
                <th className={styles.th} style={{textAlign: 'right'}}>Fee</th>
                <th className={styles.th} style={{textAlign: 'right'}}>Your Payout</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson: any) => (
                <tr key={lesson._id}>
                  <td className={styles.td}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <div style={{width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#64748b', marginRight: '12px'}}>
                        {lesson.studentName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div style={{fontWeight: '800'}}>{lesson.studentName || 'Alice Student'}</div>
                        <div style={{fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>{lesson.subject || 'Lesson'}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td} style={{textAlign: 'center', color: '#64748b', fontWeight: '600'}}>
                    {new Date(lesson.date).toLocaleDateString()}
                  </td>
                  <td className={styles.td} style={{textAlign: 'right', fontWeight: '700'}}>${lesson.price?.toFixed(2)}</td>
                  <td className={styles.td} style={{textAlign: 'right', color: '#f97316', fontWeight: '700'}}>
                    -${(lesson.price - lesson.netPayout).toFixed(2)}
                  </td>
                  <td className={styles.td} style={{textAlign: 'right'}}>
                    <span className={styles.payoutText}>${lesson.netPayout?.toFixed(2)}</span>
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
