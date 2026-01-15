// @ts-nocheck
'use client';

import React, { useState } from 'react';

export default function WithdrawalButton({ currentBalance }: { currentBalance: number }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleWithdraw = async () => {
    if (currentBalance <= 0) return alert("No funds available to withdraw.");
    
    setLoading(true);
    setStatus('');

    try {
      const res = await fetch('/api/tutor/withdraw', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setStatus(`Success! ${data.message}`);
        // Refresh the page after 3 seconds to show the updated $0 balance
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
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md ${
          loading || currentBalance <= 0 
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
          : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
        }`}
      >
        {loading ? 'Processing Transfer...' : `Withdraw $${currentBalance} Now`}
      </button>
      
      {status && (
        <div className={`p-4 rounded-lg text-sm font-bold text-center animate-in fade-in slide-in-from-bottom-2 ${
          status.startsWith('Success') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}
