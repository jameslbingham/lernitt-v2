"use client";
import React, { useEffect, useState, useMemo } from 'react';

/**
 * Utility: Status Styling Classes
 * Ported from v1 statusClass logic
 */
const getStatusClass = (s: string) => {
  if (s === "open") return "status-open";
  if (s === "pending") return "status-pending";
  if (s === "resolved" || s === "approved_refund") return "status-resolved";
  if (s === "rejected" || s === "denied") return "status-rejected";
  if (s?.startsWith("warning_")) return "status-warning";
  return "status-default";
};

export default function DisputeList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<{ [key: string]: string }>({});

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
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Dispute load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDisputes();
  }, []);

  // Ported logic for status updates and notes
  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/admin/disputes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setItems(prev => prev.map(d => d._id === id ? { ...d, status: nextStatus } : d));
      }
    } catch (err) {
      alert("Status update failed");
    }
  };

  const addNote = async (id: string) => {
    const text = noteInput[id]?.trim();
    if (!text) return;
    // Logic for note persistence would go to a /note API route
    alert(`Internal Note Added: ${text}`);
    setNoteInput(prev => ({ ...prev, [id]: "" }));
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
      {/* Ported Filter Header */}
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
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="dispute-list">
        {filteredItems.map(d => (
          <div key={d._id} className={`dispute-card ${expanded === d._id ? 'expanded' : ''}`}>
            <div className="card-header" onClick={() => setExpanded(expanded === d._id ? null : d._id)}>
              <div className="header-left">
                <span className={`status-tag ${getStatusClass(d.status)}`}>{d.status}</span>
                <span className="dispute-type">{d.type || "Dispute"}</span>
                <span className="dispute-id">#{d._id.slice(-6)}</span>
              </div>
              <div className="header-right">
                <span className="dispute-date">{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="dispute-reason">{d.reason}</div>

            {expanded === d._id && (
              <div className="card-details">
                <div className="details-grid">
                  <div className="detail-box">
                    <label>Student</label>
                    <p>{d.studentName || "User"}</p>
                  </div>
                  <div className="detail-box">
                    <label>Lesson</label>
                    <p>{d.lessonSubject || "Lesson"}</p>
                  </div>
                </div>

                <div className="action-area">
                  <button className="btn resolve" onClick={() => updateStatus(d._id, 'approved_refund')}>Approve Refund</button>
                  <button className="btn reject" onClick={() => updateStatus(d._id, 'denied')}>Deny</button>
                  <button className="btn warn" onClick={() => updateStatus(d._id, 'warning_tutor')}>Warn Tutor</button>
                </div>

                <div className="note-section">
                  <input 
                    placeholder="Add internal admin note..." 
                    value={noteInput[d._id] || ""}
                    onChange={(e) => setNoteInput({...noteInput, [d._id]: e.target.value})}
                  />
                  <button onClick={() => addNote(d._id)}>Add</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .dispute-container { font-family: sans-serif; }
        .filter-bar { display: flex; gap: 10px; margin-bottom: 20px; }
        .search-input { flex: 1; padding: 10px; border: 2px solid #000; border-radius: 8px; }
        select { padding: 10px; border: 2px solid #000; border-radius: 8px; font-weight: bold; }
        .dispute-list { display: flex; flex-direction: column; gap: 15px; }
        .dispute-card { background: white; border: 3px solid #000; border-radius: 16px; padding: 15px; transition: 0.2s; }
        .dispute-card.expanded { border-color: #2563eb; }
        .card-header { display: flex; justify-content: space-between; cursor: pointer; margin-bottom: 10px; }
        .header-left { display: flex; align-items: center; gap: 10px; }
        .status-tag { padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; border: 1px solid #000; }
        .status-open { background: #fef08a; }
        .status-resolved { background: #dcfce7; }
        .status-rejected { background: #fee2e2; }
        .status-warning { background: #f3e8ff; }
        .dispute-id { color: #888; font-family: monospace; font-size: 12px; }
        .dispute-reason { font-size: 14px; font-weight: bold; color: #333; }
        .card-details { margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
        .detail-box label { font-size: 10px; text-transform: uppercase; color: #999; display: block; }
        .detail-box p { margin: 0; font-weight: bold; font-size: 12px; }
        .action-area { display: flex; gap: 8px; margin-bottom: 15px; }
        .btn { padding: 8px 12px; border-radius: 8px; font-weight: 900; font-size: 10px; border: 2px solid #000; cursor: pointer; text-transform: uppercase; }
        .resolve { background: #22c55e; color: #fff; }
        .reject { background: #ef4444; color: #fff; }
        .warn { background: #3b82f6; color: #fff; }
        .note-section { display: flex; gap: 5px; }
        .note-section input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; }
        .note-section button { background: #000; color: #fff; border: none; padding: 0 15px; border-radius: 6px; cursor: pointer; }
        .loading-state { padding: 40px; text-align: center; font-weight: 900; font-size: 12px; color: #999; }
      `}</style>
    </div>
  );
}
