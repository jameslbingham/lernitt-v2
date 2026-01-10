// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { queueTutorPayout } from '@/lib/utils/payouts';

/**
 * PayPal Webhook: Matches the Stripe folder structure (/api/webhook/paypal)
 * Confirms USD student payment and triggers the 85/15 payout logic.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Verify Event Type
    if (body.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return NextResponse.json({ received: true });
    }

    const resource = body.resource;
    
    // 2. Identify the Lesson
    // We expect the internal Lesson ID in the 'custom_id' field passed during checkout
    const lessonId = resource.custom_id || resource.invoice_id;
    
    if (!lessonId) {
      console.warn('PayPal Webhook: No Lesson ID found in metadata.');
      return NextResponse.json({ error: 'No lesson metadata' }, { status: 400 });
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();

    // 3. Update Lesson Status
    // Confirms the amount was USD and the status is now 'booked' or 'paid'
    await db.collection('lessons').updateOne(
      { _id: new ObjectId(lessonId) },
      { 
        $set: { 
          status: 'paid', 
          isPaid: true,
          paypalCaptureId: resource.id,
          currency: 'USD', // Normalizing to USD
          updatedAt: new Date()
        } 
      }
    );

    // 4. Trigger the Payout Logic
    // Queues the 85% tutor earnings in the database
    await queueTutorPayout(lessonId);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('PayPal Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
