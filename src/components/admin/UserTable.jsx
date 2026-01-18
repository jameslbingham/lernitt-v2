"use client";
import React, { useEffect, useState, useMemo } from 'react';

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        // Defensive check: ensure we always handle an array
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("User fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleUpdate = async (userId, updates) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...updates } : u));
      }
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const searchStr = `${u.name} ${u.email} ${u.role}`.toLowerCase();
      return searchStr.includes(q.toLowerCase());
    });
  }, [users, q]);

  if (loading) return <div className="loading-txt">ACCESSING_USER_DIRECTORY...</div>;

  return (
    <div className="user-table-container">
      <div className="table-header-row">
        <input 
          placeholder="Search by name, email, or role..." 
          className="user-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="count-badge">{filteredUsers.length} Users Found</div>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Details</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u._id} className={u.isBanned ? 'banned-row' : ''}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{u.name || "Anonymous"}</span>
                    <span className="user-email">{u.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
                </td>
                <td>
                  <span className="date-cell">{new Date(u.createdAt).toLocaleDateString()}</span>
                </td>
                <td>
                  <span className={`status-pill ${u.isBanned ? 'banned' : 'active'}`}>
                    {u.isBanned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td>
                  <div className="action-cell">
                    {u.role !== 'admin' && (
                      <>
                        <button 
                          onClick={() => handleUpdate(u._id, { role: u.role === 'tutor' ? 'student' : 'tutor' })}
                          className="btn-link"
                        >
                          Switch to {u.role === 'tutor' ? 'Student' : 'Tutor'}
                        </button>
                        <button 
                          onClick={() => handleUpdate(u._id, { isBanned: !u.isBanned })}
                          className={`btn-status ${u.isBanned ? 'unban' : 'ban'}`}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .user-table-container { font-family: system-ui, sans-serif; }
        .table-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .user-search { flex: 1; padding: 12px; border: 3px solid #000; border-radius: 12px; font-weight: bold; max-width: 400px; }
        .count-badge { font-weight: 900; text-transform: uppercase; font-size: 10px; background: #000; color: #fff; padding: 6px 12px; border-radius: 20px; }
        
        .table-wrapper { background: #fff; border: 4px solid #000; border-radius: 20px; overflow: hidden; box-shadow: 10px 10px 0px 0px #000; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background: #f0f0f0; padding: 15px; font-size: 10px; font-weight: 900; text-transform: uppercase; border-bottom: 4px solid #000; }
        td { padding: 15px; border-bottom: 1px solid #eee; }
        
        .user-info { display: flex; flex-direction: column; }
        .user-name { font-weight: 800; font-size: 14px; }
        .user-email { font-size: 12px; color: #666; }
        
        .role-badge { font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 4px 8px; border: 2px solid #000; border-radius: 6px; }
        .role-badge.tutor { background: #fef08a; }
        .role-badge.student { background: #dcfce7; }
        .role-badge.admin { background: #000; color: #fff; }
        
        .date-cell { font-size: 12px; font-weight: bold; color: #888; }
        .status-pill { font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; }
        .status-pill.active { color: #16a34a; background: #f0fdf4; }
        .status-pill.banned { color: #dc2626; background: #fef2f2; }
        
        .action-cell { display: flex; gap: 10px; align-items: center; }
        .btn-link { background: none; border: none; font-size: 10px; font-weight: 900; text-decoration: underline; cursor: pointer; text-transform: uppercase; }
        .btn-status { border: 2px solid #000; padding: 4px 10px; border-radius: 6px; font-size: 9px; font-weight: 900; text-transform: uppercase; cursor: pointer; }
        .ban { background: #fee2e2; color: #991b1b; }
        .unban { background: #dcfce7; color: #166534; }
        
        .banned-row td { opacity: 0.5; }
        .loading-txt { padding: 40px; text-align: center; font-weight: 900; font-size: 12px; letter-spacing: 2px; }
      `}</style>
    </div>
  );
}
