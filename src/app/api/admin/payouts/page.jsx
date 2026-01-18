// @ts-nocheck
import React from 'react';
import PayoutRequestTable from '../../../components/admin/PayoutRequestTable';

export default function AdminPayoutsPage() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
          Payout Requests
        </h1>
        <p style={{ color: '#666', fontWeight: 'bold', fontSize: '14px' }}>
          Finalize tutor withdrawals to PayPal or Bank accounts.
        </p>
      </header>

      {/* This component uses the GET route we just created */}
      <PayoutRequestTable />
    </div>
  );
}
