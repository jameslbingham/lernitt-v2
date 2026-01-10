// @ts-nocheck
import { DateTime } from 'luxon';

/**
 * Utility to handle italki-style time zone conversions.
 * Converts local tutor time to UTC for storage, and UTC back to student's local time.
 */
export const TimeZoneEngine = {
  /**
   * Converts a local time slot (e.g., 09:00 in "Europe/Riga") to a UTC Date.
   */
  convertToUTC(date: string, time: string, zone: string): Date {
    return DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm', { zone })
      .toUTC()
      .toJSDate();
  },

  /**
   * Converts a UTC Date to a formatted string in the user's local time zone.
   */
  formatToLocal(utcDate: Date, zone: string, format: string = 'HH:mm'): string {
    return DateTime.fromJSDate(utcDate).setZone(zone).toFormat(format);
  },

  /**
   * Adjusts an entire availability calendar for a student's perspective.
   */
  translateCalendar(slots: any[], studentZone: string) {
    return slots.map(day => ({
      date: day.date,
      slots: day.slots.map(slot => {
        // Assume slot.startTime is "HH:mm" relative to tutor's zone
        // This helper will be used by the frontend to shift the visual view
        return {
          ...slot,
          localStartTime: this.formatToLocal(new Date(`${day.date}T${slot.startTime}:00Z`), studentZone),
          localEndTime: this.formatToLocal(new Date(`${day.date}T${slot.endTime}:00Z`), studentZone)
        };
      })
    }));
  }
};
