"use client";
import React, { useState } from 'react';

export default function WithdrawalButton({ balance, paypalEmail, tutorId }: any) {
  const [status, setStatus] = useState('idle'); // idle | processing | success

  const handleWithdrawal = async () => {
    if (balance <= 0 || status !== 'idle') return;
    
    setStatus('processing');
    try {
      const res = await fetch('/api/tutor/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: balance, email: paypalEmail, tutorId }),
      });

      if (res.ok) {
        setStatus('success');
        // Logic to refresh balance would be triggered here
      } else {
        const data = await res.json();
        alert(data.error || "Withdrawal failed");
        setStatus('idle');
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      setStatus('idle');
    }
  };

  return (
    <div className="button-wrapper">
      <button 
        onClick={handleWithdrawal}
        disabled={balance <= 0 || status !== 'idle'}
        className={`withdraw-btn ${status}`}
      >
        {status === 'idle' && `WITHDRAW $${balance.toFixed(2)}`}
        {status === 'processing' && 'PROCESSING...'}
        {status === 'success' && 'FUNDS SENT'}
      </button>

      <style jsx>{`
        .button-wrapper { width: 100%; }
        .withdraw-btn {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          font-weight: 900;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .withdraw-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        .withdraw-btn.idle { background-color: #000; color: #fff; }
        .withdraw-btn.idle:hover { background-color: #333; }
        .withdraw-btn.processing { background-color: #facc15; color: #000; animation: pulse 1.5s infinite; }
        .withdraw-btn.success { background-color: #22c55e; color: #fff; }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
