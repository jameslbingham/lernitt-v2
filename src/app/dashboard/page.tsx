'use client';

import React from 'react';

export default function TutorDashboard() {
  // Financial data based on your successful 15% commission seed
  const stats = [
    { label: 'Available for Payout', value: '$425.00', icon: '💰', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Lessons Completed', value: '5', icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Net Hourly Rate', value: '$85.00', icon: '💵', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Platform Fees (15%)', value: '$75.00', icon: '📉', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] p-6 md:p-12 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 text-left">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">Lernitt V2 • Bob Tutor</p>
          </div>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all">
            Withdraw Earnings
          </button>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 text-left">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 text-2xl`}>
                {stat.icon}
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-left">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900">Recent Lessons</h2>
            <button className="text-blue-600 font-bold hover:underline">
              View All History →
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                  <th className="px-8 py-6">Student</th>
                  <th className="px-8 py-6 text-center">Date</th>
                  <th className="px-8 py-6 text-right">Gross</th>
                  <th className="px-8 py-6 text-right">Fee (15%)</th>
                  <th className="px-8 py-6 text-right text-blue-600">Your Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-blue-50/10 transition-colors">
                    <td className="px-8 py-8">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black mr-4 uppercase">AS</div>
                        <div>
                          <p className="font-black text-slate-900">Alice Student</p>
                          <p className="text-slate-400 text-xs font-bold uppercase">English Lesson</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center text-slate-500 font-bold text-sm">Jan {11 - i}, 2026</td>
                    <td className="px-8 py-8 text-right font-bold text-slate-900">$100.00</td>
                    <td className="px-8 py-8 text-right text-orange-500 font-black text-sm">-$15.00</td>
                    <td className="px-8 py-8 text-right font-black text-green-600 text-xl tracking-tight">$85.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
