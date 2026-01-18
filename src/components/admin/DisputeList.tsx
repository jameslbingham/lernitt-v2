"use client";
import React, { useEffect, useState, useMemo } from 'react';

/**
 * Utility: Status Styling Classes
 * Ported from v1 statusClass logic
 */
const getStatusClass = (s) => {
  if (s === "open") return "status-open";
  if (s === "pending") return "status-pending";
  if (s === "resolved" || s === "approved_refund") return "status-resolved";
  if (s === "rejected" || s === "denied") return "status-rejected";
  if (s?.startsWith("warning_")) return "status-warning";
  return "status-default";
};

export default function DisputeList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState([]);
  const [noteInput, setNoteInput] = useState({});

  // Ported filters from v1
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    type: "",
  });

  useEffect(() => {
    async function loadDisputes() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/disputes');
        const data = await res.json();
        // Defensive check ported from v1
        const arr = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setItems(arr);
      } catch (err) {
        console.error("Dispute load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDisputes();
  }, []);

  const updateStatus = async (id, nextStatus) => {
    try {
      const res = await fetch(`/api/admin/disputes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setItems(prev => prev.map(d => (d._id === id || d.id === id) ? { ...d, status: nextStatus } : d));
      }
    } catch (err) {
      alert("Status update failed");
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const filteredItems = useMemo(() => {
    return items.filter(d => {
      const matchQ = !filters.q || JSON.stringify(d).toLowerCase().includes(filters.q.toLowerCase());
      const matchStatus = !filters.status || d.status === filters.status;
      const matchType = !filters.type || d.type === filters.type;
      return matchQ && matchStatus && matchType;
    });
  }, [items, filters]);

  if (loading) return <div className="loading-state">SYNCING_CONFLICT_DATABASE...</div>;

  return (
    <div className="dispute-container">
      {/* Filter Header Ported from v1 */}
      <div className="admin-controls">
        <div className="filter-bar">
          <input 
            placeholder="Search disputes..." 
            className="search-input"
            value={filters.q}
            onChange={(e) => setFilters({...filters, q: e.target.value})}
          />
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="approved_refund">Approved Refund</option>
            <option value="denied">Denied</option>
          </select>
        </div>
        
        <div className="bulk-actions">
          <button 
            className="btn bulk" 
            disabled={selected.length === 0}
            onClick={() => selected.forEach(id => updateStatus(id, 'resolved'))}
          >
            Bulk Resolve ({selected.length})
          </button>
        </div>
      </div>

      <div className="dispute-list">
        {filteredItems.map(d => (
          <div key={d._id || d.id} className={`dispute-card ${expanded === (d._id || d.id) ? 'expanded' : ''} ${d.status === 'open' ? 'urgent' : ''}`}>
            <div className="card-header">
              <div className="header-left">
                <input 
                  type="checkbox" 
                  checked={selected.includes(d._id || d.id)} 
                  onChange={() => toggleSelect(d._id || d.id)} 
                />
                <span className={`status-tag ${getStatusClass(d.status)}`}>{d.status || 'open'}</span>
                <span className="dispute-type">{d.type || "Refund"}</span>
                <span className="dispute-id">#{ (d._id || d.id).slice(-6) }</span>
              </div>
              <div className="header-right" onClick={() => setExpanded(expanded === (d._id || d.id) ? null : (d._id || d.id))}>
                <span className="expand-icon">{expanded === (d._id || d.id) ? '−' : '+'}</span>
              </div>
            </div>

            <div className="dispute-reason" onClick={() => setExpanded(expanded === (d._id || d.id) ? null : (d._id || d.id))}>
              {d.reason}
            </div>

            {expanded === (d._id || d.id) && (
              <div className="card-details">
                <div className="details-grid">
                  <div className="detail-box">
                    <label>Student / User</label>
                    <p>{d.student?.name || d.user || "Unknown"}</p>
                  </div>
                  <div className="detail-box">
                    <label>Lesson Reference</label>
                    <p>{d.lessonSubject || d.lessonId || "N/A"}</p>
                  </div>
                </div>

                <div className="action-area">
                  <button className="btn resolve" onClick={() => updateStatus(d._id || d.id, 'approved_refund')}>Approve Refund</button>
                  <button className="btn reject" onClick={() => updateStatus(d._id || d.id, 'denied')}>Deny</button>
                  <button className="btn warn" onClick={() => updateStatus(d._id || d.id, 'warning_tutor')}>Warn Tutor</button>
                </div>
                
                {d.notes && d.notes.length > 0 && (
                  <div className="v1-notes">
                    <label>Internal History</label>
                    {d.notes.map((n, i) => (
                      <div key={i} className="note-item">
                        <strong>{n.by}:</strong> {n.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .dispute-container { font-family: sans-serif; }
        .admin-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 10px; }
        .filter-bar { display: flex; gap: 10px; flex: 1; }
        .search-input { flex: 1; padding: 12px; border: 3px solid #000; border-radius: 12px; font-weight: bold; }
        select { padding: 10px; border: 3px solid #000; border-radius: 12px; font-weight: 900; text-transform: uppercase; font-size: 10px; }
        .dispute-list { display: flex; flex-direction: column; gap: 12px; }
        .dispute-card { background: white; border: 3px solid #000; border-radius: 16px; padding: 16px; transition: 0.2s; box-shadow: 6px 6px 0px 0px #000; }
        .dispute-card.urgent { background: #fffcf0; border-color: #eab308; }
        .dispute-card.expanded { border-color: #2563eb; transform: scale(1.01); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .status-tag { padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; border: 2px solid #000; }
        .status-open { background: #fef08a; }
        .status-resolved { background: #dcfce7; }
        .status-rejected { background: #fee2e2; }
        .status-warning { background: #f3e8ff; }
        .dispute-type { font-weight: 900; text-transform: uppercase; font-size: 10px; color: #666; }
        .dispute-id { color: #aaa; font-family: monospace; font-size: 11px; }
        .expand-icon { font-weight: 900; cursor: pointer; font-size: 20px; }
        .dispute-reason { font-size: 15px; font-weight: 800; color: #000; cursor: pointer; }
        .card-details { margin-top: 16px; padding-top: 16px; border-top: 2px solid #eee; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .detail-box label { font-size: 9px; text-transform: uppercase; color: #999; font-weight: 900; display: block; margin-bottom: 4px; }
        .detail-box p { margin: 0; font-weight: 700; font-size: 13px; color: #333; }
        .action-area { display: flex; gap: 10px; margin-bottom: 20px; }
        .btn { padding: 10px 16px; border-radius: 10px; font-weight: 900; font-size: 10px; border: 2px solid #000; cursor: pointer; text-transform: uppercase; transition: 0.1s; }
        .btn:active { transform: translateY(2px); }
        .resolve { background: #22c55e; color: #fff; }
        .reject { background: #ef4444; color: #fff; }
        .warn { background: #3b82f6; color: #fff; }
        .bulk { background: #000; color: #fff; }
        .bulk:disabled { opacity: 0.3; cursor: not-allowed; }
        .v1-notes { background: #f9f9f9; padding: 12px; border-radius: 10px; border: 1px solid #ddd; }
        .note-item { font-size: 12px; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .loading-state { padding: 60px; text-align: center; font-weight: 900; font-size: 14px; color: #000; letter-spacing: 2px; }
      `}</style>
    </div>
  );
}
