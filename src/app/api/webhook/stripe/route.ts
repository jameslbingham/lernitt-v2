// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/database/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  // In Next.js 2026, we use the raw body for signature verification
  console.log('Stripe Webhook received');

  try {
    const event = JSON.parse(body);
    const dbClient = await clientPromise;
    const db = dbClient.db();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Mark Payment as succeeded
      await db.collection('payments').updateOne(
        { 'providerIds.checkoutSessionId': session.id },
        { $set: { status: 'succeeded', updatedAt: new Date() } }
      );

      // Find the payment to get the lesson ID
      const payment = await db.collection('payments').findOne({ 
        'providerIds.checkoutSessionId': session.id 
      });

      if (payment && payment.lesson) {
        // Mark Lesson as paid
        await db.collection('lessons').updateOne(
          { _id: payment.lesson },
          { 
            $set: { 
              status: 'paid', 
              isPaid: true, 
              paidAt: new Date() 
            } 
          }
        );
        console.log(`Lesson ${payment.lesson} marked PAID via Stripe`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
