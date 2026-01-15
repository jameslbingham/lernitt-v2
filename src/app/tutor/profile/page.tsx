// @ts-nocheck
import React from 'react';
import TutorAnalyticsDashboard from '@/components/TutorAnalyticsDashboard';
// Assuming you have a session helper to get the logged-in user
import { getServerSession } from "next-auth/next"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

export default async function TutorProfilePage() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'tutor') {
    return <div className="p-10 text-center">Access Denied. Please log in as a tutor.</div>;
  }

  // Fetch the tutor's specific profile data including payout preferences
  const tutor = await User.findById(session.user.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-10 px-6">
        
        {/* Profile Header Section */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {tutor.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{tutor.name}</h2>
              <p className="text-slate-500 font-medium">Professional Tutor • {tutor.preferredCurrency} {tutor.hourlyRate}/hr</p>
              <div className="mt-2 flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${tutor.payoutsEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  Payouts: {tutor.payoutsEnabled ? 'Enabled' : 'Action Required'}
                </span>
                <span className="text-sm text-slate-600">
                  Withdrawal Method: <strong>{tutor.withdrawalMethod}</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Sophisticated Analytics Dashboard Integration */}
        <section>
          <TutorAnalyticsDashboard tutorId={tutor._id.toString()} />
        </section>

      </div>
    </div>
  );
}
