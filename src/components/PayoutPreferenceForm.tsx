// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';

export default function PayoutPreferenceForm({ user }: { user: any }) {
  const [method, setMethod] = useState(user.withdrawalMethod || 'Stripe');
  const [paypalEmail, setPaypalEmail] = useState(user.paypalEmail || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/user/payout-preference', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalMethod: method, paypalEmail }),
      });

      if (res.ok) {
        setMessage('Success: Payout preference updated.');
      } else {
        setMessage('Error: Failed to save preferences.');
      }
    } catch (err) {
      setMessage('Error: Network failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
      <h3 className="text-xl font-bold text-slate-900 mb-2">Payout Method Election</h3>
      <p className="text-sm text-slate-500 mb-6">
        Choose how you would like to receive your earnings. You can elect to withdraw funds into your PayPal account.
      </p>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Toggle Selection */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setMethod('Stripe')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${
              method === 'Stripe' 
              ? 'border-blue-600 bg-blue-50 text-blue-700' 
              : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
            }`}
          >
            Stripe (Bank Transfer)
          </button>
          <button
            type="button"
            onClick={() => setMethod('PayPal')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${
              method === 'PayPal' 
              ? 'border-blue-600 bg-blue-50 text-blue-700' 
              : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
            }`}
          >
            PayPal Account
          </button>
        </div>

        {/* Conditional PayPal Input */}
        {method === 'PayPal' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Your PayPal Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g., tutor-payments@paypal.com"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
            />
          </div>
        )}

        {/* Status Message */}
        {message && (
          <p className={`text-sm font-bold ${message.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-300 transition-colors"
        >
          {loading ? 'Saving Preferences...' : 'Save Payout Election'}
        </button>
      </form>
    </div>
  );
}
