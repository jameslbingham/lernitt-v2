// @ts-nocheck
'use client';
import React, { useState } from 'react';

export default function WithdrawalButton({ currentBalance }: { currentBalance: number }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tutor/withdraw', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatus("Success!");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus("Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWithdraw}
      disabled={loading || currentBalance <= 0}
      className="w-full py-4 bg-green-600 text-white rounded-xl font-bold"
    >
      {loading ? 'Processing...' : `Withdraw $${currentBalance}`}
    </button>
  );
}
