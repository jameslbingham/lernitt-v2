// src/components/dashboard/StatusBanner.tsx
import React from 'react';

interface StatusBannerProps {
  status: 'none' | 'pending' | 'approved' | 'rejected';
}

export default function StatusBanner({ status }: StatusBannerProps) {
  // Logic to determine color and text based on Bob's status
  const config = {
    pending: {
      bg: '#fff7ed',
      border: '#fdba74',
      text: '#9a3412',
      title: 'Application Under Review',
      msg: 'Our admin team is currently verifying your profile. You will be visible in the marketplace once approved.',
      icon: '⏳'
    },
    rejected: {
      bg: '#fef2f2',
      border: '#fca5a5',
      text: '#991b1b',
      title: 'Action Required',
      msg: 'Your application was not approved. Please check your email for specific feedback or contact support.',
      icon: '❌'
    },
    approved: {
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#166534',
      title: 'Profile Verified',
      msg: 'Welcome to Lernitt! Your profile is now live. Students can book lessons with you directly.',
      icon: '✅'
    },
    none: null
  };

  const current = config[status];

  if (!current || status === 'none') return null;

  return (
    <div style={{
      backgroundColor: current.bg,
      border: `1px solid ${current.border}`,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '30px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{ fontSize: '32px' }}>{current.icon}</div>
      <div>
        <h4 style={{ margin: 0, fontWeight: '900', color: current.text, fontSize: '16px' }}>
          {current.title}
        </h4>
        <p style={{ margin: '4px 0 0 0', color: current.text, fontSize: '14px', fontWeight: '500', opacity: 0.8 }}>
          {current.msg}
        </p>
      </div>
    </div>
  );
}
