// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

export const CalendarEngine = {
  /**
   * Generates the final availability for a specific date range.
   * Priority: Overrides > Recurring Template.
   */
  async getAvailableSlots(tutorId: string, startDate: Date, endDate: Date) {
    const dbClient = await clientPromise;
    const db = dbClient.db();

    // 1. Fetch all recurring and override rules for this tutor
    const rules = await db.collection('advancedavailabilities').find({
      tutor: new ObjectId(tutorId),
      active: true
    }).toArray();

    // 2. Fetch existing bookings to prevent overlaps
    const bookings = await db.collection('lessons').find({
      tutor: new ObjectId(tutorId),
      status: { $nin: ['cancelled', 'expired'] },
      startTime: { $gte: startDate, $lte: endDate }
    }).toArray();

    // 3. The Logic Loop: For every day in the requested range...
    let finalCalendar = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];

      // Check for a specific Date Override first (italki-style)
      let dailySlots = rules.find(r => 
        r.type === 'override' && 
        r.specificDate.toISOString().split('T')[0] === dateString
      )?.slots;

      // If no override, use the Recurring Template
      if (!dailySlots) {
        dailySlots = rules.find(r => 
          r.type === 'recurring' && 
          r.dayOfWeek === dayOfWeek
        )?.slots || [];
      }

      // 4. Remove slots that are already booked
      const availableDailySlots = dailySlots.filter(slot => {
        const slotStart = new Date(`${dateString}T${slot.startTime}:00Z`);
        const isBooked = bookings.some(b => 
          new Date(b.startTime).getTime() === slotStart.getTime()
        );
        return !isBooked;
      });

      finalCalendar.push({
        date: dateString,
        slots: availableDailySlots
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return finalCalendar;
  }
};
