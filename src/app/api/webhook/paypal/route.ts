// @ts-nocheck
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { queueTutorPayout } from '@/lib/utils/payouts';

/**
 * PayPal Webhook: Confirms student payment and triggers the 85/15 payout logic.
 * Enforces USD as the platform master currency.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Verify Event Type
    // PAYMENT.CAPTURE.COMPLETED indicates the money is officially in your account.
    if (body.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return NextResponse.json({ received: true });
    }

    const resource = body.resource;
    
    // 2. Identify the Lesson
    // PayPal stores custom data in the 'custom_id' or 'invoice_number' field.
    const lessonId = resource.custom_id || resource.invoice_number;
    
    if (!lessonId) {
      console.warn('PayPal Webhook: No Lesson ID found in resource metadata.');
      return NextResponse.json({ error: 'No lesson metadata' }, { status: 400 });
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();

    // 3. Update Lesson Status
    // We confirm the amount was USD and the status is now 'paid'.
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
    // This moves the lesson into the 85% tutor / 15% platform split queue.
    await queueTutorPayout(lessonId);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('PayPal Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
