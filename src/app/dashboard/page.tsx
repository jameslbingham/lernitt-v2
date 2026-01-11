'use client';

import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ChevronRight,
  Wallet,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function TutorDashboard() {
  const stats = [
    { label: 'Available for Payout', value: '$425.00', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Lessons Completed', value: '5', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Net Hourly Rate', value: '$85.00', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Platform Fees', value: '$75.00', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] p-6 md:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="text-left">
            <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">Your business performance at a glance.</p>
          </div>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center">
            <Wallet size={18} className="mr-2" />
            Withdraw
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-left">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                <stat.icon size={24} />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Recent Lessons Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-2xl font-black">Recent Lessons</h2>
            <button className="text-blue-600 font-bold flex items-center hover:text-blue-800">
              Full History <ChevronRight size={20} className="ml-1" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-6">Student & Session</th>
                  <th className="px-8 py-6 text-center">Date</th>
                  <th className="px-8 py-6 text-right">Gross</th>
                  <th className="px-8 py-6 text-right">Fee (15%)</th>
                  <th className="px-8 py-6 text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-8 py-8">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black mr-4">AS</div>
                        <div>
                          <p className="font-black leading-tight">Alice Student</p>
                          <p className="text-slate-400 text-xs font-bold mt-1 uppercase">1-on-1 Lesson</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center text-slate-500 font-bold text-sm">Jan {11 - item}, 2026</td>
                    <td className="px-8 py-8 text-right font-bold text-lg">$100.00</td>
                    <td className="px-8 py-8 text-right text-orange-500 font-black text-sm">-$15.00</td>
                    <td className="px-8 py-8 text-right font-black text-green-600 text-xl">$85.00</td>
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
