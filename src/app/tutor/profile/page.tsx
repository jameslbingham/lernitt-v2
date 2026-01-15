// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import LessonCompletionModal from '@/components/tutor/LessonCompletionModal';

export default function TutorProfile() {
  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Fetch Bob's data on load
  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => setBalance(data.totalEarnings || 0));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white border rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Tutor Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-blue-600 font-medium mb-1">Available Funds</p>
            <p className="text-4xl font-bold text-blue-900">${balance.toFixed(2)}</p>
          </div>
          
          <div className="flex flex-col gap-3 justify-center">
            {/* The Earning Trigger */}
            <button 
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Test: Complete $25.00 Lesson
            </button>
            
            {/* The Withdrawal Trigger (Day 8 & 9) */}
            <button className="bg-gray-900 text-white py-2 rounded-lg hover:bg-black transition">
              Withdraw Funds
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <LessonCompletionModal onComplete={() => {
          setShowModal(false);
          window.location.reload(); // Refresh to see the new $21.25
        }} />
      )}
    </div>
  );
}
