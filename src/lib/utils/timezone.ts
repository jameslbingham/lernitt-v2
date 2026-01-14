// src/lib/utils/timezone.ts
import { DateTime } from 'luxon';

/**
 * Lernitt-V2 Master Timezone Engine
 * Handles global conversions and V1 slot-slicing logic.
 */
export const TimeZoneEngine = {
  /**
   * Converts a local tutor date/time to a UTC Date object for MongoDB.
   */
  convertToUTC(date: string, time: string, zone: string): Date {
    return DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm', { zone })
      .toUTC()
      .toJSDate();
  },

  /**
   * Converts a UTC Date back to a local string (e.g., for Bob to see his schedule).
   */
  formatToLocal(utcDate: Date, zone: string, format: string = 'HH:mm'): string {
    return DateTime.fromJSDate(utcDate).setZone(zone).toFormat(format);
  },

  /**
   * V1 LOGIC: Snaps any time to the nearest 30-minute block.
   * Ensures Bob's calendar stays organized in clean half-hour chunks.
   */
  snapToPolicy(dt: DateTime) {
    const minute = dt.minute;
    if (minute === 0 || minute === 30) {
      return dt.set({ second: 0, millisecond: 0 });
    }
    return minute < 30
      ? dt.set({ minute: 30, second: 0, millisecond: 0 })
      : dt.plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 });
  },

  /**
   * V1 LOGIC: Takes a time range (e.g., 9am - 12pm) and cuts it into 
   * bookable pieces based on lesson duration (e.g., 60 mins).
   */
  generateBookableSlots(
    day: DateTime, 
    ranges: {startTime: string, endTime: string}[], 
    durationMins: number, 
    intervalMins: number
  ) {
    const slots: string[] = [];
    
    for (const range of ranges) {
      let current = day.set({
        hour: parseInt(range.startTime.split(':')[0]),
        minute: parseInt(range.startTime.split(':')[1]),
      });
      
      const end = day.set({
        hour: parseInt(range.endTime.split(':')[0]),
        minute: parseInt(range.endTime.split(':')[1]),
      });

      current = this.snapToPolicy(current);

      while (current.plus({ minutes: durationMins }) <= end) {
        slots.push(current.toUTC().toISO()!);
        current = this.snapToPolicy(current.plus({ minutes: intervalMins }));
      }
    }
    return slots;
  },

  /**
   * Frontend Helper: Shifts the entire calendar view to the Student's local time.
   */
  translateCalendar(slots: any[], studentZone: string) {
    return slots.map(day => ({
      date: day.date,
      slots: day.slots.map((slot: any) => {
        return {
          ...slot,
          localStartTime: this.formatToLocal(new Date(`${day.date}T${slot.startTime}:00Z`), studentZone),
          localEndTime: this.formatToLocal(new Date(`${day.date}T${slot.endTime}:00Z`), studentZone)
        };
      })
    }));
  }
};
