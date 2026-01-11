import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ChevronRight,
  Wallet,
  CheckCircle2,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

export default function TutorDashboard() {
  // Financial data based on your successful 15% commission seed
  const stats = [
    { 
      label: 'Available for Payout', 
      value: '$425.00', 
      icon: Wallet, 
      description: 'Cleared and ready to withdraw',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Lessons Completed', 
      value: '5', 
      icon: CheckCircle2, 
      description: 'Verified sessions this month',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      label: 'Net Hourly Rate', 
      value: '$85.00', 
      icon: DollarSign, 
      description: 'Average after 15% platform fee',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      label: 'Platform Fees', 
      value: '$75.00', 
      icon: TrendingUp, 
      description: 'Total Lernitt service fees',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navigation / Branding */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">Your business performance at a glance.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center">
              <Calendar size={18} className="mr-2" />
              Schedule
            </button>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center">
              <Wallet size={18} className="mr-2" />
              Withdraw
            </button>
          </div>
        </div>

        {/* High-Level Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-hover hover:shadow-md cursor-default">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                <stat.icon size={24} />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.1em] mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              <p className="text-slate-400 text-xs font-medium mt-3 italic">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900">Recent Lessons</h2>
            <button className="group text-blue-600 font-bold flex items-center hover:text-blue-800 transition-colors">
              Full History <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Student & Session</th>
                  <th className="px-8 py-6 text-center">Date</th>
                  <th className="px-8 py-6 text-right">Gross Price</th>
                  <th className="px-8 py-6 text-right">Fee (15%)</th>
                  <th className="px-8 py-6 text-right">Your Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-8 py-8">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black mr-4 shadow-inner">
                          AS
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">Alice Student</p>
                          <p className="text-slate-400 text-xs font-bold mt-1 uppercase">1-on-1 English Lesson</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center text-slate-500 font-bold text-sm">Jan {11 - i}, 2026</td>
                    <td className="px-8 py-8 text-right font-bold text-slate-900 text-lg">$100.00</td>
                    <td className="px-8 py-8 text-right text-orange-500 font-black text-sm">-$15.00</td>
                    <td className="px-8 py-8 text-right font-black text-green-600 text-xl tracking-tight">
                      $85.00
                    </td>
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
