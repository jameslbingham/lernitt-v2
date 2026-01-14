// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';

interface AnalyticsData {
  summary: {
    retentionRate: string;
    activeStudentCount: number;
    loyalStudentCount: number;
    projectedIncome: number;
  };
  pacing: Array<{
    studentName: string;
    hierarchy: {
      name: string;
      level: string;
    };
    module: string;
    notes: string;
    date: string;
  }>;
}

export default function TutorAnalyticsDashboard({ tutorId }: { tutorId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`/api/tutor/analytics?tutorId=${tutorId}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to load tutor analytics", error);
      } finally {
        setLoading(false);
      }
    }
    if (tutorId) fetchAnalytics();
  }, [tutorId]);

  if (loading) return <div className="p-10 text-center font-medium">Loading professional insights...</div>;
  if (!data) return <div className="p-10 text-center text-red-500 font-bold">Error: Unable to retrieve dashboard data.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Tutor Business Intelligence</h1>
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          V2 Sophisticated Analytics
        </div>
      </header>

      {/* 1. Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-blue-600 uppercase">Retention Rate</p>
          <p className="text-3xl font-black mt-1">{data.summary.retentionRate}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-green-600 uppercase">Projected Income</p>
          <p className="text-3xl font-black mt-1">${data.summary.projectedIncome}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-purple-600 uppercase">Active Students</p>
          <p className="text-3xl font-black mt-1">{data.summary.activeStudentCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-orange-600 uppercase">Loyal (3+ Lessons)</p>
          <p className="text-3xl font-black mt-1">{data.summary.loyalStudentCount}</p>
        </div>
      </div>

      {/* 2. Advanced Curriculum & Retention Planning Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Student Curriculum Pacing & Retention Notes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-500 uppercase bg-slate-50">
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Hierarchy (Topic/Subject)</th>
                <th className="px-6 py-4">Current Module</th>
                <th className="px-6 py-4">Retention Strategy Notes</th>
                <th className="px-6 py-4 text-right">Last Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.pacing.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.studentName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                      {item.hierarchy.level}: {item.hierarchy.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.module}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 italic leading-relaxed max-w-xs">
                    "{item.notes}"
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
