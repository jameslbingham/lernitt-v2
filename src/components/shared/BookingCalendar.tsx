// src/components/shared/BookingCalendar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

interface BookingCalendarProps {
  tutorId: string;
  onSlotSelect: (iso: string) => void;
}

export default function BookingCalendar({ tutorId, onSlotSelect }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(DateTime.now().startOf('day'));
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const studentTz = DateTime.now().zoneName;

  useEffect(() => {
    async function fetchAvailableSlots() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          tutorId,
          date: selectedDate.toISODate()!,
          tz: studentTz,
          dur: '60' // Defaulting to 60min lesson
        });
        const res = await fetch(`/api/booking/slots?${query}`);
        const data = await res.json();
        setSlots(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load slots");
      } finally {
        setLoading(false);
      }
    }
    fetchAvailableSlots();
  }, [selectedDate, tutorId, studentTz]);

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    DateTime.now().startOf('day').plus({ days: i })
  );

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select a Lesson Time</h3>
        <p className="text-slate-500 font-medium text-sm mt-1">Automatically showing times in {studentTz}</p>
      </div>

      {/* Date Picker (Horizontal Scroller) */}
      <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar bg-white">
        {weekDays.map((day) => {
          const isSelected = selectedDate.toISODate() === day.toISODate();
          return (
            <button
              key={day.toISODate()}
              onClick={() => setSelectedDate(day)}
              className={`flex-1 min-w-[90px] py-6 flex flex-col items-center transition-all relative ${
                isSelected ? 'bg-blue-50/30' : 'hover:bg-slate-50'
              }`}
            >
              <span className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                {day.toFormat('ccc')}
              </span>
              <span className={`text-xl font-black ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                {day.toFormat('dd')}
              </span>
              {isSelected && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
            </button>
          );
        })}
      </div>

      {/* Slots Section */}
      <div className="p-8 min-h-[340px]">
        {loading ? (
          <div className="grid grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-14 bg-slate-100 rounded-2xl" />)}
          </div>
        ) : slots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {slots.map((iso) => {
              const timeLabel = DateTime.fromISO(iso).toFormat('HH:mm');
              const isSelected = selectedSlot === iso;
              return (
                <button
                  key={iso}
                  onClick={() => {
                    setSelectedSlot(iso);
                    onSlotSelect(iso);
                  }}
                  className={`py-4 rounded-2xl font-bold text-sm transition-all border-2 ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                      : 'bg-white border-slate-100 text-slate-700 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {timeLabel}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">🗓️</div>
            <h4 className="font-bold text-slate-900">No availability today</h4>
            <p className="text-slate-500 text-sm mt-1">Try selecting another date above.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {slots.length} Slots Available
        </span>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-xs font-bold text-slate-500">Instant Booking Enabled</span>
        </div>
      </div>
    </div>
  );
}
