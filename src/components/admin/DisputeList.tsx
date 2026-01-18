"use client";
import React, { useEffect, useState, useMemo } from 'react';

/** * Types to satisfy the TypeScript Compiler and clear red errors
 *
 */
interface DisputeNote {
  by: string;
  at: string;
  text: string;
}

interface DisputeItem {
  _id?: string;
  id?: string;
  status: string;
  type?: string;
  reason: string;
  createdAt: string;
  studentName?: string;
  student?: { name: string; email: string };
  user?: string;
  lessonSubject?: string;
  lessonId?: string;
  notes?: DisputeNote[];
}

const getStatusClass = (s: string): string => {
  if (s === "open") return "status-open";
  if (s === "pending") return "status-pending";
  if (s === "resolved" || s === "approved_refund") return "status-resolved";
  if (s === "rejected" || s === "denied") return "status-rejected";
  if (s && s.startsWith("warning_")) return "status-warning";
  return "status-default";
};

export default function DisputeList() {
  // Explicitly typing state to resolve "Property does not exist" errors
  const [items, setItems] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    q: "",
    status: "",
  });

  useEffect(() => {
    async function loadDisputes() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/disputes');
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data && data.items) || [];
        setItems(arr);
      } catch (err) {
        console.error("Dispute load error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadDisputes();
  }, []);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/admin/disputes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setItems(prev => prev.map(d => {
          const dId = d._id || d.id;
          return dId === id ? { ...d, status: nextStatus } : d;
        }));
      }
    } catch (err) {
      alert("Update failed");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const filteredItems = useMemo(() => {
    return items.filter(d => {
      const searchStr = JSON.stringify(d).toLowerCase();
      const matchQ = !filters.q || searchStr.includes(filters.q.toLowerCase());
      const matchStatus = !filters.status || d.status === filters.status;
      return matchQ && matchStatus;
    });
  }, [items, filters]);

  if (loading) return <div className="loading-box">SYNCING_LERNITT_CONFLICTS...</div>;

  return (
    <div className="dispute-container">
      <div className="admin-header-row">
        <div className="search-group">
          <input 
            placeholder="Filter keyword..." 
            className="main-search"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Status: All</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <button 
          className="bulk-resolve-btn"
          disabled={selected.length === 0}
          onClick={() => selected.forEach(id => updateStatus(id, 'resolved'))}
        >
          Bulk Resolve ({selected.length})
        </button>
      </div>

      <div className="dispute-cards-wrapper">
        {filteredItems.map(d => {
          const currentId = (d._id || d.id) as string;
          const isExpanded = expanded === currentId;
          const isSelected = selected.includes(currentId);

          return (
            <div key={currentId} className={`dispute-card ${isExpanded ? 'active' : ''}`}>
              <div className="card-top">
                <div className="left-meta">
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => toggleSelect(currentId)} 
                  />
                  <span className={`tag ${getStatusClass(d.status)}`}>
                    {d.status || 'open'}
                  </span>
                  <span className="type-label">{d.type || "Marketplace"}</span>
                </div>
                <div className="right-meta" onClick={() => setExpanded(isExpanded ? null : currentId)}>
                  <span className="date-text">{new Date(d.createdAt).toLocaleDateString()}</span>
                  <span className="toggle-symbol">{isExpanded ? '▼' : '▶'}</span>
                </div>
              </div>

              <div className="reason-summary" onClick={() => setExpanded(isExpanded ? null : currentId)}>
                {d.reason}
              </div>

              {isExpanded && (
                <div className="expansion-panel">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>User Involved</label>
                      <p>{d.student?.name || d.studentName || d.user || "Unknown"}</p>
                    </div>
                    <div className="info-item">
                      <label>Lesson Ref</label>
                      <p>{d.lessonSubject || d.lessonId || "None"}</p>
                    </div>
                  </div>

                  <div className="action-row">
                    <button className="btn-action green" onClick={() => updateStatus(currentId, 'approved_refund')}>Approve Refund</button>
                    <button className="btn-action red" onClick={() => updateStatus(currentId, 'denied')}>Deny Dispute</button>
                    <button className="btn-action blue" onClick={() => updateStatus(currentId, 'warning_tutor')}>Warn Tutor</button>
                  </div>
                  
                  {d.notes && d.notes.length > 0 && (
                    <div className="admin-notes-log">
                      <label>Internal Log</label>
                      {d.notes.map((n, idx) => (
                        <div key={idx} className="note-entry">
                          <strong>{n.by}:</strong> {n.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .dispute-container { font-family: system-ui, sans-serif; }
        .admin-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; gap: 15px; }
        .search-group { display: flex; gap: 10px; flex: 1; }
        .main-search { flex: 1; padding: 12px; border: 3px solid #000; border-radius: 12px; font-weight: bold; }
        select { padding: 10px; border: 3px solid #000; border-radius: 12px; font-weight: 900; text-transform: uppercase; font-size: 11px; cursor: pointer; }
        .bulk-resolve-btn { background: #000; color: #fff; padding: 12px 20px; border-radius: 12px; border: none; font-weight: 900; text-transform: uppercase; cursor: pointer; font-size: 11px; }
        .bulk-resolve-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .dispute-cards-wrapper { display: flex; flex-direction: column; gap: 12px; }
        .dispute-card { background: white; border: 3px solid #000; border-radius: 16px; padding: 16px; box-shadow: 6px 6px 0px 0px #000; }
        .dispute-card.active { border-color: #2563eb; }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .left-meta { display: flex; align-items: center; gap: 10px; }
        .tag { padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; border: 2px solid #000; }
        .status-open { background: #fef08a; }
        .status-resolved { background: #dcfce7; }
        .status-rejected { background: #fee2e2; }
        .status-warning { background: #f3e8ff; }
        .type-label { font-weight: 900; text-transform: uppercase; font-size: 10px; color: #888; }
        .right-meta { cursor: pointer; display: flex; align-items: center; gap: 10px; }
        .date-text { font-size: 11px; color: #aaa; font-weight: bold; }
        .toggle-symbol { font-size: 12px; font-weight: 900; }
        .reason-summary { font-size: 15px; font-weight: 800; color: #000; cursor: pointer; }
        .expansion-panel { margin-top: 15px; padding-top: 15px; border-top: 2px solid #f0f0f0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .info-item label { font-size: 9px; text-transform: uppercase; color: #999; font-weight: 900; display: block; margin-bottom: 4px; }
        .info-item p { margin: 0; font-weight: 700; font-size: 13px; color: #333; }
        .action-row { display: flex; gap: 10px; margin-bottom: 20px; }
        .btn-action { padding: 10px 16px; border-radius: 10px; font-weight: 900; font-size: 10px; border: 2px solid #000; cursor: pointer; text-transform: uppercase; }
        .green { background: #22c55e; color: #fff; }
        .red { background: #ef4444; color: #fff; }
        .blue { background: #3b82f6; color: #fff; }
        .admin-notes-log { background: #f9f9f9; padding: 12px; border-radius: 10px; border: 1px solid #ddd; }
        .note-entry { font-size: 11px; margin-bottom: 6px; color: #555; }
        .loading-box { padding: 50px; text-align: center; font-weight: 900; color: #000; letter-spacing: 1px; font-size: 14px; }
      `}</style>
    </div>
  );
}
