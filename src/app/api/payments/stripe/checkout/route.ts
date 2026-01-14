// src/app/api/payments/stripe/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Initialize Stripe simply to avoid 'apiVersion' compatibility errors
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const { lessonId, studentId } = await req.json();

    const client = await clientPromise;
    const db = client.db("lernitt_v2");

    // 1. Fetch lesson details to get the price
    const lesson = await db.collection("lessons").findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: `Language Lesson`,
            description: `Tutoring session on Lernitt`
          },
          unit_amount: Math.round(lesson.amount * 100), 
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?payment=cancelled`,
      metadata: { 
        lessonId: lessonId.toString(), 
        studentId: studentId.toString() 
      }
    });

    // 3. Create Pending Payment Record
    await db.collection("payments").insertOne({
      user: new ObjectId(studentId),
      lesson: new ObjectId(lessonId),
      provider: 'stripe',
      amount: lesson.amount,
      status: 'pending',
      providerIds: { checkoutSessionId: session.id },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("STRIPE_CHECKOUT_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
