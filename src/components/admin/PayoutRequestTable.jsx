"use client";
import React, { useEffect, useState } from 'react';

export default function PayoutRequestTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    async function loadRequests() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/finance/payouts');
        const data = await res.json();
        // Defensive check to ensure we always have an array
        setRequests(Array.isArray(data) ? data : (data && data.items) || []);
      } catch (err) {
        console.error("Payout fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  /**
   * Automated PayPal Execution Logic
   * Admin Bob (Owner) clicks this to pay Tutor Bob (User) via the PayPal API
   *
   */
  const handlePayPalPay = async (payoutId) => {
    if (!window.confirm("Confirm: Execute automated PayPal payout?")) return;
    
    setProcessingId(payoutId);
    try {
      const res = await fetch('/api/admin/finance/payouts/paypal-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId })
      });

      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== payoutId));
        alert("PayPal Payout Success.");
      } else {
        const err = await res.json();
        alert(`PayPal Error: ${err.error}`);
      }
    } catch (err) {
      alert("System error during PayPal execution.");
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Manual Approval Logic
   * For non-PayPal methods or manual overrides
   */
  const handleManualProcess = async (payoutId) => {
    if (!window.confirm("Mark as paid manually? This updates the ledger.")) return;

    setProcessingId(payoutId);
    try {
      const res = await fetch('/api/admin/finance/payouts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId })
      });

      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== payoutId));
        alert("Manual Payout recorded.");
      }
    } catch (err) {
      alert("Manual update failed.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="loading-state">SYNCING_PAYOUT_QUEUE...</div>;

  return (
    <div className="payout-container">
      <header className="table-header">
        <h2>Withdrawal Requests</h2>
        <p>Admin Control: Approve and execute tutor earnings transfers.</p>
      </header>

      <div className="table-card">
        <table className="payout-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Tutor</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Execute</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="5" className="empty-row">No pending requests.</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r._id || r.id}>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="tutor-cell">
                      <strong>{r.tutorName || "Tutor User"}</strong>
                      <span>{r.tutorEmail}</span>
                    </div>
                  </td>
                  <td className="amount-cell">${r.amount?.toFixed(2)}</td>
                  <td>
                    <span className={`method-badge ${r.method}`}>
                      {r.method || 'Bank'}
                    </span>
                  </td>
                  <td>
                    <div className="action-stack">
                      {/* Check if tutor has a PayPal election [cite: 2026-01-12] */}
                      {r.method === 'paypal' ? (
                        <button 
                          className="btn-pay paypal"
                          disabled={processingId === (r._id || r.id)}
                          onClick={() => handlePayPalPay(r._id || r.id)}
                        >
                          {processingId === (r._id || r.id) ? "Working..." : "Pay via PayPal"}
                        </button>
                      ) : (
                        <button 
                          className="btn-pay manual"
                          disabled={processingId === (r._id || r.id)}
                          onClick={() => handleManualProcess(r._id || r.id)}
                        >
                          Approve Manual
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .payout-container { font-family: system-ui, sans-serif; }
        .table-header { margin-bottom: 24px; }
        .table-header h2 { font-weight: 900; text-transform: uppercase; margin: 0; font-size: 28px; letter-spacing: -1px; }
        .table-header p { font-size: 12px; color: #666; font-weight: bold; margin: 4px 0 0; }
        
        .table-card { background: #fff; border: 4px solid #000; border-radius: 24px; overflow: hidden; box-shadow: 12px 12px 0px 0px #000; }
        .payout-table { width: 100%; border-collapse: collapse; text-align: left; }
        
        th { background: #f8f8f8; padding: 18px; font-size: 10px; font-weight: 900; text-transform: uppercase; border-bottom: 4px solid #000; color: #555; }
        td { padding: 18px; border-bottom: 2px solid #eee; font-size: 14px; }
        
        .tutor-cell { display: flex; flex-direction: column; }
        .tutor-cell strong { font-size: 14px; color: #000; }
        .tutor-cell span { font-size: 11px; color: #888; font-weight: 600; }
        
        .amount-cell { font-weight: 900; color: #16a34a; font-size: 16px; }
        
        .method-badge { font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 4px 8px; border: 2px solid #000; border-radius: 6px; }
        .method-badge.paypal { background: #dbeafe; color: #1e40af; }
        .method-badge.stripe { background: #f3e8ff; color: #6b21a8; }
        
        .action-stack { display: flex; gap: 8px; }
        .btn-pay { border: none; padding: 10px 16px; border-radius: 12px; font-weight: 900; font-size: 10px; text-transform: uppercase; cursor: pointer; transition: 0.2s; border: 2px solid #000; }
        .btn-pay.paypal { background: #0070ba; color: #fff; border-color: #0070ba; }
        .btn-pay.paypal:hover { background: #005ea6; }
        .btn-pay.manual { background: #fff; color: #000; }
        .btn-pay.manual:hover { background: #eee; }
        
        .btn-pay:disabled { opacity: 0.4; cursor: not-allowed; }
        
        .empty-row { text-align: center; padding: 60px; color: #999; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .loading-state { padding: 80px; text-align: center; font-weight: 900; font-size: 14px; letter-spacing: 2px; }
      `}</style>
    </div>
  );
}
