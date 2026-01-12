import { NextResponse } from 'next/server';
// Using relative path to avoid the Line 2 error on your MacBook Air
import clientPromise from '../../../lib/mongodb';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("lernitt_v2");

    // 1. Check Bob's Profile for PayPal vs Stripe preference
    const user = await db.collection('users').findOne({ email: 'bob_tutor@example.com' });
    const payoutMethod = user?.payoutMethod || 'stripe'; 

    // 2. Fetch the earnings you synced from your seed script
    const lessons = await db.collection("lessons").find({}).toArray();
    const totalNet = lessons.reduce((sum: number, l: any) => sum + (Number(l.netAmount) || 0), 0);

    if (totalNet <= 0) {
      return NextResponse.json({ error: "No funds available for withdrawal" }, { status: 400 });
    }

    // 3. Logic for PayPal vs Stripe Withdrawal
    if (payoutMethod === 'paypal') {
      // Record the PayPal withdrawal request
      await db.collection("withdrawals").insertOne({
        amount: totalNet,
        method: 'paypal',
        paypalEmail: user.paypalEmail || user.email,
        date: new Date(),
        status: 'pending_paypal_approval'
      });
      return NextResponse.json({ success: true, amount: totalNet, method: 'PayPal' });
    } else {
      // Execute the Stripe Payout
      const payout = await stripe.payouts.create({
        amount: Math.round(totalNet * 100), // Convert to cents for Stripe
        currency: 'usd',
      });
      
      await db.collection("withdrawals").insertOne({
        amount: totalNet,
        method: 'stripe',
        stripeId: payout.id,
        date: new Date(),
        status: 'completed'
      });
      return NextResponse.json({ success: true, amount: totalNet, method: 'Stripe' });
    }
  } catch (error: any) {
    console.error('Withdrawal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
