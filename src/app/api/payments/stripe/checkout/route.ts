// src/app/api/payments/stripe/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const { lessonId, studentId } = await req.json();

    const client = await clientPromise;
    const db = client.db("lernitt_v2");

    // 1. Fetch lesson details
    const lesson = await db.collection("lessons").findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    // 2. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Lesson with Tutor` },
          unit_amount: Math.round(lesson.amount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?payment=cancelled`,
      metadata: { lessonId, studentId }
    });

    // 3. Create Pending Payment Record
    await db.collection("payments").insertOne({
      user: new ObjectId(studentId),
      lesson: new ObjectId(lessonId),
      provider: 'stripe',
      amount: lesson.amount * 100,
      status: 'pending',
      providerIds: { checkoutSessionId: session.id },
      createdAt: new Date()
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
