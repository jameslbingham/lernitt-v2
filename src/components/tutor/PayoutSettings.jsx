"use client";
import React, { useState, useEffect } from 'react';

/**
 * Payout Settings UI
 * Allows Tutor Bob to set his PayPal email for automated withdrawals.
 * [cite: 2026-01-12]
 */
export default function PayoutSettings() {
  const [method, setMethod] = useState("stripe");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load existing preferences on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/tutor/profile');
        const data = await res.json();
        if (data.payoutMethod) setMethod(data.payoutMethod);
        if (data.paypalEmail) setPaypalEmail(data.paypalEmail);
      } catch (err) {
        console.error("Failed to load payout settings");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch('/api/tutor/profile/payout', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutMethod: method, paypalEmail })
      });

      if (res.ok) {
        setMessage("Payout preferences updated successfully!");
      } else {
        const data = await res.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">SYNCING_PAYMENT_PREFERENCES...</div>;

  return (
    <div className="payout-settings-card">
      <h3>Withdrawal Method</h3>
      <p className="hint">Choose how you want Admin Bob to send your earnings [cite: 2026-01-12].</p>

      <form onSubmit={handleSave}>
        <div className="method-selector">
          <label className={`option ${method === 'stripe' ? 'selected' : ''}`}>
            <input 
              type="radio" 
              name="method" 
              value="stripe" 
              checked={method === 'stripe'} 
              onChange={(e) => setMethod(e.target.value)}
            />
            <div className="label-content">
              <strong>Stripe Express</strong>
              <span>Direct to bank (v1 Default)</span>
            </div>
          </label>

          <label className={`option ${method === 'paypal' ? 'selected' : ''}`}>
            <input 
              type="radio" 
              name="method" 
              value="paypal" 
              checked={method === 'paypal'} 
              onChange={(e) => setMethod(e.target.value)}
            />
            <div className="label-content">
              <strong>PayPal</strong>
              <span>Instant transfer to email [cite: 2026-01-12]</span>
            </div>
          </label>
        </div>

        {method === 'paypal' && (
          <div className="paypal-input-group">
            <label>PayPal Account Email</label>
            <input 
              type="email" 
              placeholder="e.g. bob-tutor@example.com"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? "SAVING..." : "UPDATE PAYOUT PROFILE"}
        </button>

        {message && <div className="status-msg">{message}</div>}
      </form>

      <style jsx>{`
        .payout-settings-card { background: #fff; border: 4px solid #000; padding: 30px; border-radius: 24px; box-shadow: 10px 10px 0px 0px #000; }
        h3 { margin: 0; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
        .hint { font-size: 12px; color: #666; margin-bottom: 25px; font-weight: bold; }
        
        .method-selector { display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px; }
        .option { display: flex; align-items: center; gap: 15px; padding: 15px; border: 2px solid #eee; border-radius: 12px; cursor: pointer; transition: 0.2s; }
        .option.selected { border-color: #000; background: #f9f9f9; }
        .option input { transform: scale(1.5); }
        .label-content strong { display: block; font-size: 14px; text-transform: uppercase; }
        .label-content span { font-size: 11px; color: #888; }
        
        .paypal-input-group { margin-bottom: 25px; }
        .paypal-input-group label { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 6px; }
        .paypal-input-group input { width: 100%; padding: 12px; border: 2px solid #000; border-radius: 10px; font-size: 14px; font-weight: bold; }
        
        .save-btn { width: 100%; background: #000; color: #fff; border: none; padding: 15px; border-radius: 12px; font-weight: 900; cursor: pointer; text-transform: uppercase; transition: 0.2s; }
        .save-btn:hover { background: #22c55e; }
        .save-btn:disabled { opacity: 0.5; }
        
        .status-msg { margin-top: 15px; font-size: 12px; font-weight: 900; text-align: center; color: #16a34a; text-transform: uppercase; }
        .loading { padding: 40px; text-align: center; font-weight: 900; font-size: 12px; color: #999; }
      `}</style>
    </div>
  );
}
