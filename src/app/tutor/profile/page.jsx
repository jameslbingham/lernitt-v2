// @ts-nocheck
import React from 'react';
import ProfileForm from '../../../components/tutor/ProfileForm';

export default function TutorProfilePage() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '36px', margin: 0 }}>
          Profile Verification
        </h1>
        <p style={{ fontSize: '14px', color: '#666', fontWeight: '700' }}>
          Italki-Standard: Tutors must provide an intro video for marketplace approval.
        </p>
      </header>

      <ProfileForm />
    </div>
  );
}
