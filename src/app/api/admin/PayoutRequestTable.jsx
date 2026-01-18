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
        setRequests(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Payout fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  /**
   * Logic to Execute Payout
   * Ported from v1 Stripe Transfer & Manual Approve logic
   */
  const handleProcess = async (payoutId) => {
    const confirmMsg = "Are you sure you want to execute this payout? This will deduct funds from the tutor's balance.";
    if (!window.confirm(confirmMsg)) return;

    setProcessingId(payoutId);
    try {
      const res = await fetch('/api/admin/finance/payouts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId })
      });

      if (res.ok) {
        // Refresh the list to remove the processed item
        setRequests(prev => prev.filter(r => r._id !== payoutId));
        alert("Payout processed successfully.");
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert("System error processing payout.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="loading-state">SYNCING_PAYOUT_QUEUE...</div>;

  return (
    <div className="payout-container">
      <header className="table-header">
        <h2>Pending Payouts</h2>
        <p>Review and execute tutor withdrawal requests.</p>
      </header>

      <div className="table-card">
        <table className="payout-table">
          <thead>
            <tr>
              <th>Request Date</th>
              <th>Tutor</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="5" className="empty-row">No pending requests.</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r._id}>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="tutor-cell">
                      <strong>{r.tutorName || "Tutor"}</strong>
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
                    <button 
                      className="process-btn"
                      disabled={processingId === r._id}
                      onClick={() => handleProcess(r._id)}
                    >
                      {processingId === r._id ? "Processing..." : "Approve & Pay"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .payout-container { font-family: sans-serif; }
        .table-header { margin-bottom: 24px; }
        .table-header h2 { font-weight: 900; text-transform: uppercase; margin: 0; font-size: 28px; }
        .table-header p { font-size: 12px; color: #666; font-weight: bold; margin: 4px 0 0; }
        
        .table-card { background: #fff; border: 4px solid #000; border-radius: 24px; overflow: hidden; box-shadow: 12px 12px 0px 0px #000; }
        .payout-table { width: 100%; border-collapse: collapse; text-align: left; }
        
        th { background: #f0f0f0; padding: 16px; font-size: 10px; font-weight: 900; text-transform: uppercase; border-bottom: 4px solid #000; }
        td { padding: 16px; border-bottom: 2px solid #eee; font-size: 14px; }
        
        .tutor-cell { display: flex; flex-direction: column; }
        .tutor-cell strong { font-size: 14px; color: #000; }
        .tutor-cell span { font-size: 11px; color: #888; }
        
        .amount-cell { font-weight: 900; color: #16a34a; }
        
        .method-badge { font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 4px 8px; border: 2px solid #000; border-radius: 6px; }
        .method-badge.paypal { background: #dbeafe; color: #1e40af; }
        .method-badge.stripe { background: #f3e8ff; color: #6b21a8; }
        
        .process-btn { background: #000; color: #fff; border: none; padding: 10px 16px; border-radius: 10px; font-weight: 900; font-size: 10px; text-transform: uppercase; cursor: pointer; transition: 0.2s; }
        .process-btn:hover { background: #22c55e; }
        .process-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .empty-row { text-align: center; padding: 40px; color: #999; font-weight: bold; font-style: italic; }
        .loading-state { padding: 60px; text-align: center; font-weight: 900; font-size: 14px; letter-spacing: 2px; }
      `}</style>
    </div>
  );
}
