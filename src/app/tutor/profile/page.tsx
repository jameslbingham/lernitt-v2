// @ts-nocheck
import React from 'react';
import TutorAnalyticsDashboard from '@/components/TutorAnalyticsDashboard';
import PayoutPreferenceForm from '@/components/PayoutPreferenceForm';
import { getServerSession } from "next-auth/next"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

export default async function TutorProfilePage() {
  await dbConnect();
  
  // 1. Get the current tutor's session for security
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

  // 2. Fetch the tutor's full profile including payout preferences and earnings
  const tutor = await User.findById(session.user.id).lean();

  if (!tutor) {
    return <div className="p-10 text-center">Tutor profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
        
        {/* Header Section: Basic Identity and Payout Status */}
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
          
          <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Election</p>
            <p className="text-lg font-bold text-indigo-600 mt-1">
              {tutor.withdrawalMethod} {tutor.withdrawalMethod === 'PayPal' ? 'Account' : 'Direct Deposit'}
            </p>
          </div>
        </section>

        {/* Financial & Payout Election: Toggle between Stripe and PayPal */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Payout Settings</h2>
            {/* We pass the tutor object to the form to pre-populate existing settings */}
            <PayoutPreferenceForm user={JSON.parse(JSON.stringify(tutor))} />
          </div>
          
          <div className="bg-indigo-900 p-8 rounded-2xl text-white shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">Financial Choice</h3>
              <p className="text-indigo-100 leading-relaxed mb-6">
                All tutors have the choice to withdraw funds into their PayPal account 
                if that is what they have elected in their profile. Ensure your PayPal 
                email is verified to receive funds without delay.
              </p>
            </div>
            <div className="text-xs font-mono bg-indigo-800/50 p-4 rounded-lg border border-indigo-700">
              WITHDRAWALS: {tutor.payoutsEnabled ? 'ACTIVE' : 'ACTION REQUIRED'}
            </div>
          </div>
        </section>

        {/* Analytics Section: 3-Layer Category Hierarchy & Retention Rates */}
        <section className="pt-6 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 px-2">Curriculum Insights & Student Retention</h2>
          <TutorAnalyticsDashboard tutorId={tutor._id.toString()} />
        </section>

      </div>
    </div>
  );
}
