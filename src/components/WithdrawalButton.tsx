// @ts-nocheck
'use client';
import React, { useState } from 'react';

export default function WithdrawalButton({ currentBalance }: { currentBalance: number }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleWithdraw = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/tutor/withdraw', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Success! ${data.message}`);
        setTimeout(() => window.location.reload(), 3000);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus("Error: Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleWithdraw}
        disabled={loading || currentBalance <= 0}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          loading || currentBalance <= 0 ? 'bg-slate-200 text-slate-400' : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {loading ? 'Processing...' : `Withdraw $${currentBalance} Now`}
      </button>
      {status && <div className="p-4 rounded-lg text-sm font-bold text-center bg-slate-100">{status}</div>}
    </div>
  );
}
