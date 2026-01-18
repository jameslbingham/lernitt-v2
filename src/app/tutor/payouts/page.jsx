// @ts-nocheck
import React from 'react';
import PayoutSettings from '../../../components/tutor/PayoutSettings';

export default function TutorPayoutsPage() {
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '32px', margin: 0 }}>
          Finance Settings
        </h1>
        <p style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>
          Configure how you receive your earnings from Lernitt.
        </p>
      </header>

      <PayoutSettings />
    </div>
  );
}
