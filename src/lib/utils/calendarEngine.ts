// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { TimeZoneEngine } from './timezone';

/**
 * CalendarEngine: The core logic center for Lernitt-V2 scheduling.
 * It manages italki-style overrides, recurring templates, and global time zone shifts.
 */
export const CalendarEngine = {
  /**
   * Generates a final list of available slots for a tutor.
   * Priority Order Logic:
   * 1. Date Overrides: Specific exceptions set for a single date
   * 2. Recurring Templates: The standard weekly 9-5 routine
   * 3. Booking Filter: Removes slots already occupied in the 'lessons' collection
   * 4. Time Zone Translation: Shifts every result into the student's local time
   */
  async getAvailableSlots(
    tutorId: string, 
    startDate: Date, 
    endDate: Date, 
    studentZone: string = 'UTC'
  ) {
    const dbClient = await clientPromise;
    const db = dbClient.db();

    // 1. Fetch tutor profile to identify their native time zone
    const tutor = await db.collection('users').findOne({ _id: new ObjectId(tutorId) });
    if (!tutor) return [];
    const tutorZone = tutor.timezone || 'UTC';

    // 2. Fetch all recurring templates and date-specific overrides
    const rules = await db.collection('advancedavailabilities').find({
      tutor: new ObjectId(tutorId),
      active: true
    }).toArray();

    // 3. Fetch existing lessons for this tutor to prevent double-booking
    const bookings = await db.collection('lessons').find({
      tutor: new ObjectId(tutorId),
      status: { $nin: ['cancelled', 'expired'] },
      startTime: { $gte: startDate, $lte: endDate }
    }).toArray();

    let finalCalendar = [];
    let currentDate = new Date(startDate);

    // 4. Iterate through each day in the requested date range
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();

      // Priority 1: Check for an italki-style Date Override
      let dailySlots = rules.find(r => 
        r.type === 'override' && 
        r.specificDate.toISOString().split('T')[0] === dateString
      )?.slots;

      // Priority 2: Fallback to the Recurring Weekly Template
      if (!dailySlots) {
        dailySlots = rules.find(r => 
          r.type === 'recurring' && 
          r.dayOfWeek === dayOfWeek
        )?.slots || [];
      }

      // 5. Filter and Map Slots to the Student's perspective
      const processedSlots = dailySlots.filter(slot => {
        // Convert the tutor's local slot time to UTC for database comparison
        const slotUTC = TimeZoneEngine.convertToUTC(dateString, slot.startTime, tutorZone);
        
        // Remove the slot if it matches an existing lesson's start time
        const isBooked = bookings.some(b => 
          new Date(b.startTime).getTime() === slotUTC.getTime()
        );
        
        return !isBooked;
      }).map(slot => {
        const slotUTC = TimeZoneEngine.convertToUTC(dateString, slot.startTime, tutorZone);
        const slotEndUTC = TimeZoneEngine.convertToUTC(dateString, slot.endTime, tutorZone);

        return {
          ...slot,
          // Generate localized time strings for the student's browser
          studentLocalStart: TimeZoneEngine.formatToLocal(slotUTC, studentZone),
          studentLocalEnd: TimeZoneEngine.formatToLocal(slotEndUTC, studentZone),
          // Store raw UTC values for the final booking logic
          utcStart: slotUTC,
          utcEnd: slotEndUTC,
          // Support for introductory lesson filtering
          isTrialAvailable: slot.isTrialAvailable ?? true 
        };
      });

      finalCalendar.push({
        date: dateString,
        slots: processedSlots
      });

      // Advance to the next calendar day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return finalCalendar;
  }
};
