// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';

export default function StudentNotebookPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState(null);

  useEffect(() => {
    async function loadNotes() {
      try {
        const res = await fetch('/api/student/notebooks');
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Notebook load error");
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  if (loading) return <div className="loading">OPENING_NOTEBOOKS...</div>;

  return (
    <div className="notebook-container">
      <aside className="note-sidebar">
        <header className="sidebar-header">
          <h2>My Notebooks</h2>
          <button className="new-note-btn">+ New Note</button>
        </header>
        <div className="note-list">
          {notes.length === 0 ? (
            <p className="empty">No notes yet. Start writing after your next lesson!</p>
          ) : (
            notes.map(n => (
              <div 
                key={n._id} 
                className={`note-item ${activeNote?._id === n._id ? 'active' : ''}`}
                onClick={() => setActiveNote(n)}
              >
                <strong>{n.title}</strong>
                <span>{n.tutorName} • {new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="note-editor">
        {activeNote ? (
          <div className="editor-view">
            <input 
              className="title-input" 
              defaultValue={activeNote.title} 
              placeholder="Note Title"
            />
            <div className="meta-info">
              Session with <strong>{activeNote.tutorName}</strong>
            </div>
            <textarea 
              className="content-area"
              defaultValue={activeNote.content}
              placeholder="What did you learn today?"
            />
            <button className="save-btn">Save Changes</button>
          </div>
        ) : (
          <div className="empty-state">
            <span className="icon">📝</span>
            <h3>Select a note to read or edit</h3>
          </div>
        )}
      </main>

      <style jsx>{`
        .notebook-container { display: flex; height: calc(100vh - 80px); background: #fff; font-family: system-ui, sans-serif; }
        
        .note-sidebar { width: 320px; border-right: 4px solid #000; display: flex; flex-direction: column; }
        .sidebar-header { padding: 20px; border-bottom: 2px solid #eee; }
        .sidebar-header h2 { font-weight: 900; text-transform: uppercase; margin: 0 0 10px; font-size: 18px; }
        .new-note-btn { width: 100%; background: #000; color: #fff; border: none; padding: 10px; border-radius: 8px; font-weight: 900; cursor: pointer; }
        
        .note-list { flex: 1; overflow-y: auto; }
        .note-item { padding: 15px 20px; border-bottom: 1px solid #eee; cursor: pointer; transition: 0.2s; }
        .note-item:hover { background: #f9f9f9; }
        .note-item.active { background: #facc15; }
        .note-item strong { display: block; font-size: 14px; }
        .note-item span { font-size: 11px; font-weight: 700; color: #666; }
        
        .note-editor { flex: 1; padding: 40px; background: #fafafa; }
        .editor-view { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; height: 100%; }
        .title-input { background: none; border: none; font-size: 32px; font-weight: 900; text-transform: uppercase; margin-bottom: 10px; outline: none; }
        .meta-info { font-size: 12px; font-weight: 700; color: #888; margin-bottom: 20px; }
        .content-area { flex: 1; background: #fff; border: 3px solid #000; border-radius: 16px; padding: 20px; font-size: 16px; line-height: 1.6; outline: none; resize: none; margin-bottom: 20px; }
        .save-btn { background: #16a34a; color: #fff; border: none; padding: 15px 30px; border-radius: 12px; font-weight: 900; text-transform: uppercase; cursor: pointer; align-self: flex-end; }
        
        .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ccc; }
        .empty-state .icon { font-size: 64px; margin-bottom: 10px; }
        .empty-state h3 { font-weight: 900; text-transform: uppercase; }
        .loading { padding: 100px; text-align: center; font-weight: 900; letter-spacing: 2px; }
        .empty { padding: 20px; font-size: 12px; color: #999; text-align: center; font-style: italic; }
      `}</style>
    </div>
  );
}
