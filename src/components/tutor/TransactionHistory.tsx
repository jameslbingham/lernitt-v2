"use client";
import React, { useEffect, useState } from 'react';

/**
 * Utility: fmtDate
 * Ported from v1 to handle v2 ISO date strings
 */
const fmtDate = (s: string) => {
  const d = new Date(s);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
};

export default function TransactionHistory({ refreshTrigger }: { refreshTrigger: number }) {
  // Explicitly typed to satisfy the TypeScript compiler
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ q: '', status: '' });

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(filter).toString();
        const res = await fetch(`/api/tutor/transactions?${query}`);
        const data = await res.json();
        
        // Ensure data is an array to prevent .map() crashes
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Ledger fetch error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [refreshTrigger, filter]);

  if (loading) return <div className="loading-text">SYNCING LEDGER...</div>;

  return (
    <div className="history-wrapper">
      <div className="history-header">
        <h3 className="history-title">Financial History</h3>
        <select 
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          className="history-filter"
        >
          <option value="">All Statuses</option>
          <option value="succeeded">Paid</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="list-container">
        {items.length === 0 ? (
          <div className="empty-state">No Records Found</div>
        ) : (
          items.map((tx) => (
            <div key={tx._id} className="transaction-item">
              <div className="tx-info">
                <p className="tx-method">{tx.method || 'Payout'}</p>
                <p className="tx-date">{fmtDate(tx.createdAt)}</p>
              </div>
              <div className="tx-amount-group">
                <p className={`tx-amount ${tx.status === 'succeeded' ? 'success' : 'pending'}`}>
                  ${tx.amount?.toFixed(2)}
                </p>
                <span className="tx-status">{tx.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .loading-text { font-size: 10px; font-weight: 900; color: #666; padding: 20px; }
        .history-wrapper { margin-top: 24px; }
        .history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .history-title { font-size: 12px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
        .history-filter { font-size: 10px; font-weight: bold; border: 2px solid #000; border-radius: 8px; padding: 4px 8px; text-transform: uppercase; }
        .list-container { display: flex; flex-direction: column; gap: 12px; }
        .empty-state { padding: 24px; text-align: center; border: 1px solid #333; border-radius: 16px; font-size: 10px; font-weight: bold; color: #555; text-transform: uppercase; }
        .transaction-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background-color: #1a1a1a; border: 1px solid #333; border-radius: 16px; }
        .tx-method { font-size: 10px; font-weight: 900; color: #fff; text-transform: uppercase; margin: 0; }
        .tx-date { font-size: 9px; color: #666; font-family: monospace; margin: 4px 0 0 0; }
        .tx-amount { font-size: 14px; font-weight: 900; margin: 0; }
        .tx-amount.success { color: #4ade80; }
        .tx-amount.pending { color: #facc15; }
        .tx-status { font-size: 8px; font-weight: 900; text-transform: uppercase; color: #555; display: block; text-align: right; }
      `}</style>
    </div>
  );
}
