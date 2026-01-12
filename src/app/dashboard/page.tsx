'use client';

import React from 'react';
import styles from './dashboard.module.css';

export default function TutorDashboard() {
  // Static stats matching your $85 net payout logic
  const stats = [
    { label: 'Available for Payout', value: '$425.00', icon: '💰' },
    { label: 'Lessons Completed', value: '5', icon: '✅' },
    { label: 'Net Hourly Rate', value: '$85.00', icon: '💵' },
    { label: 'Platform Fees (15%)', value: '$75.00', icon: '📉' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Header Section */}
        <div className={styles.header}>
          <div>
            <h1 style={{fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em'}}>Dashboard</h1>
            <p style={{color: '#64748b', fontSize: '18px', fontWeight: '500'}}>Lernitt V2 Engine • Bob Tutor Account</p>
          </div>
          <button className={styles.withdrawBtn}>Withdraw Earnings</button>
        </div>

        {/* Financial Cards Grid */}
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <div style={{fontSize: '28px', marginBottom: '20px'}}>{stat.icon}</div>
              <p style={{fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px'}}>{stat.label}</p>
              <h3 style={{fontSize: '32px', fontWeight: '900', margin: '10px 0 0 0'}}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Lesson History Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2 style={{fontSize: '24px', fontWeight: '900'}}>Recent Lessons</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Student</th>
                <th className={styles.th} style={{textAlign: 'center'}}>Date</th>
                <th className={styles.th} style={{textAlign: 'right'}}>Gross Price</th>
                <th className={styles.th} style={{textAlign: 'right'}}>Lernitt Fee</th>
                <th className={styles.th} style={{textAlign: 'right'}}>Your Payout</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item}>
                  <td className={styles.td}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <div style={{width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#64748b', marginRight: '12px'}}>AS</div>
                      <div>
                        <div style={{fontWeight: '800'}}>Alice Student</div>
                        <div style={{fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>1-on-1 Lesson</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td} style={{textAlign: 'center', color: '#64748b', fontWeight: '600'}}>Jan {11 - item}, 2026</td>
                  <td className={styles.td} style={{textAlign: 'right', fontWeight: '700'}}>$100.00</td>
                  <td className={styles.td} style={{textAlign: 'right', color: '#f97316', fontWeight: '700'}}>-$15.00</td>
                  <td className={styles.td} style={{textAlign: 'right'}}>
                    <span className={styles.payoutText}>$85.00</span>
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
