// @ts-nocheck
import React from 'react';
import TutorAnalyticsDashboard from '@/components/TutorAnalyticsDashboard';
import PayoutPreferenceForm from '@/components/PayoutPreferenceForm';
import WithdrawalButton from '@/components/WithdrawalButton'; // Merged: Import the action button
import { getServerSession } from "next-auth/next"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

export default async function TutorProfilePage() {
  await dbConnect();
  
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'tutor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-slate-500 mt-2">Please sign in with a tutor account to view this page.</p>
        </div>
      </div>
    );
  }

  const tutor = await User.findById(session.user.id).lean();

  if (!tutor) {
    return <div className="p-10 text-center">Tutor profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
        
        {/* Header Section: Identity & Current Payout Election Status */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black">
              {tutor.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">{tutor.name}</h1>
              <p className="text-slate-500 font-medium">
                {tutor.preferredCurrency} {tutor.hourlyRate}/hr • {tutor.email}
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Withdrawal Election</p>
            <p className="text-lg font-bold text-indigo-600 mt-1">
              {tutor.withdrawalMethod} {tutor.withdrawalMethod === 'PayPal' ? 'Account' : 'Direct Deposit'}
            </p>
          </div>
        </section>

        {/* Financial Section: Election Form & Live Withdrawal Action */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Payout Settings</h2>
            <PayoutPreferenceForm user={JSON.parse(JSON.stringify(tutor))} />
          </div>
          
          {/* Merged Sidebar: Current Balance and Withdrawal Button */}
          <div className="bg-indigo-900 p-8 rounded-2xl text-white shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-1 opacity-80 uppercase tracking-tight">Available Balance</h3>
              <p className="text-5xl font-black mb-6">${tutor.totalEarnings.toFixed(2)}</p>
              
              <div className="space-y-4">
                <p className="text-indigo-100 text-sm leading-relaxed">
                  Funds will be processed via your elected <strong>{tutor.withdrawalMethod}</strong> method.
                </p>
                {/* Merged: The functional button that triggers the POST request */}
                <WithdrawalButton currentBalance={tutor.totalEarnings} />
              </div>
            </div>
            
            <div className="text-xs font-mono bg-indigo-800/50 p-4 rounded-lg border border-indigo-700">
              ACCOUNT STATUS: {tutor.payoutsEnabled ? 'VERIFIED' : 'PENDING'}
            </div>
          </div>
        </section>

        {/* Analytics Section: 3-Layer Hierarchy & Retention */}
        <section className="pt-6 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 px-2">Curriculum Insights & Student Retention</h2>
          <TutorAnalyticsDashboard tutorId={tutor._id.toString()} />
        </section>

      </div>
    </div>
  );
}
