// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Creates a notification record in the database for a user.
 * This is the standard v2 replacement for your v1 notify() helper.
 */
export async function createNotification(data: {
  recipientId: string;
  type: 'booking' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  link?: string;
}) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const newNotification = {
    recipient: new ObjectId(data.recipientId),
    type: data.type,
    title: data.title,
    message: data.message,
    isRead: false,
    link: data.link || "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('notifications').insertOne(newNotification);

  console.log(`Notification ${result.insertedId} sent to user ${data.recipientId}`);

  return { success: true, notificationId: result.insertedId };
}
