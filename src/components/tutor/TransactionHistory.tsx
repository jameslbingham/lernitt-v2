"use client";
import React, { useEffect, useState, useMemo } from 'react';

// Ported v1 Utility: fmtDate
const fmtDate = (s: string) => {
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Ported v1 Component: StatusBadge
function StatusBadge({ s }: { s: string }) {
  const base = "px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-tighter";
  if (s === "succeeded" || s === "paid")
    return <span className={`${base} bg-green-50 border-green-200 text-green-800`}>paid</span>;
  if (s === "failed")
    return <span className={`${base} bg-red-50 border-red-200 text-red-800`}>failed</span>;
  if (s === "queued" || s === "processing")
    return <span className={`${base} bg-yellow-50 border-yellow-200 text-yellow-800`}>{s}</span>;
  return <span className={`${base} bg-blue-50 border-blue-200 text-blue-800`}>{s}</span>;
}

export default function TransactionHistory({ refreshTrigger }: { refreshTrigger: number }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ q: '', status: '' });

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger, filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filter).toString();
      const res = await fetch(`/api/tutor/transactions?${query}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ledger fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Financial Ledger</h3>
        <div className="flex gap-2">
           <select 
            onChange={(e) => setFilter({...filter, status: e.target.value})}
            className="text-[10px] font-bold border-2 border-black rounded-lg px-2 py-1 uppercase"
           >
             <option value="">All Status</option>
             <option value="succeeded">Paid</option>
             <option value="processing">Processing</option>
             <option value="failed">Failed</option>
           </select>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-bold uppercase">
            No transactions found in this period
          </div>
        ) : (
          items.map((tx: any) => (
            <div key={tx._id} className="group relative flex justify-between items-center p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-black transition-all shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${tx.type === 'withdrawal' ? 'bg-red-50' : 'bg-green-50'}`}>
                   {tx.type === 'withdrawal' ? '↓' : '↑'}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">
                    {tx.method || 'Transfer'} Request
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">{fmtDate(tx.createdAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black ${tx.type === 'withdrawal' ? 'text-red-500' : 'text-green-600'}`}>
                  {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toFixed(2)}
                </p>
                <StatusBadge s={tx.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
