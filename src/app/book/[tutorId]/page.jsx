// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BookLessonPage({ params }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(60);
  const [isTrial, setIsTrial] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Ported slot fetcher
  useEffect(() => {
    async function loadSlots() {
      setLoading(true);
      try {
        const res = await fetch(`/api/availability/${params.tutorId}/slots?dur=${duration}&from=${selectedDate}`);
        const data = await res.json();
        setSlots(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Slots load error"); }
      finally { setLoading(false); }
    }
    loadSlots();
  }, [params.tutorId, duration, selectedDate]);

  const handleBooking = async (iso) => {
    if (!window.confirm("Confirm booking this slot?")) return;
    const end = new Date(new Date(iso).getTime() + (isTrial ? 30 : duration) * 60000);
    
    try {
      const res = await fetch('/api/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutor: params.tutorId,
          startTime: iso,
          endTime: end.toISOString(),
          isTrial,
          price: isTrial ? 0 : 25 // Default price logic placeholder
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert("Booking Reserved!");
        window.location.href = isTrial ? `/my-lessons` : `/pay/${data._id}`;
      } else {
        const err = await res.json();
        alert(`Booking Error: ${err.error}`);
      }
    } catch (err) { alert("System error"); }
  };

  return (
    <div className="booking-page">
      <header>
        <h1>Schedule Lesson</h1>
        <p>Pick a date and time that works for you.</p>
      </header>

      <div className="controls">
        <label>Date: <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} /></label>
        <label>Duration: 
          <select value={duration} onChange={e => setDuration(Number(e.target.value))}>
            <option value={30}>30 Min</option>
            <option value={60}>60 Min</option>
            <option value={90}>90 Min</option>
          </select>
        </label>
        <label><input type="checkbox" checked={isTrial} onChange={e => setIsTrial(e.target.checked)} /> Free Trial (30m)</label>
      </div>

      <div className="slots-grid">
        {loading ? <p>Loading Times...</p> : slots.length === 0 ? <p>No availability for this date.</p> : (
          slots.map(iso => (
            <button key={iso} className="slot-btn" onClick={() => handleBooking(iso)}>
              {new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </button>
          ))
        )}
      </div>

      <style jsx>{`
        .booking-page { padding: 40px; max-width: 800px; margin: 0 auto; font-family: sans-serif; }
        header h1 { font-weight: 900; text-transform: uppercase; margin: 0; }
        .controls { display: flex; gap: 20px; margin: 30px 0; background: #eee; padding: 20px; border-radius: 12px; }
        .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
        .slot-btn { background: #fff; border: 2px solid #000; padding: 15px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.2s; }
        .slot-btn:hover { background: #facc15; }
      `}</style>
    </div>
  );
}
