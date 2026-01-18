// @ts-nocheck
import { DateTime } from 'luxon';

/**
 * LERNITT-V2 TIMEZONE ENGINE
 * Centralized logic for UTC storage and Victorian Admin display.
 *
 */

export const VICTORIA_TZ = "Australia/Melbourne";
export const UTC_TZ = "UTC";

export const TimezoneEngine = {
  /**
   * DATABASE GATEKEEPER: Converts any date/time input to a UTC JS Date.
   *
   */
  toUTC(date: string, time?: string, zone: string = VICTORIA_TZ): Date {
    const input = time ? `${date} ${time}` : date;
    const format = time ? 'yyyy-MM-dd HH:mm' : undefined;
    
    if (format) {
      return DateTime.fromFormat(input, format, { zone }).toUTC().toJSDate();
    }
    return DateTime.fromISO(input, { zone }).toUTC().toJSDate();
  },

  /**
   * DISPLAY FORMATTER: Converts UTC Date to a specific string.
   * Defaults to Victoria for Bob's Admin views. [cite: 2026-01-10]
   */
  formatInZone(date: Date | string, zone: string = VICTORIA_TZ, format: string = 'ccc, dd LLL yyyy, hh:mm a'): string {
    const dt = date instanceof Date ? DateTime.fromJSDate(date) : DateTime.fromISO(date);
    return dt.setZone(zone).toFormat(format);
  },

  /**
   * SNAP LOGIC: Forces bookings into 30-minute slots.
   */
  snapToPolicy(dt: DateTime) {
    const minute = dt.minute;
    if (minute === 0 || minute === 30) return dt.set({ second: 0, millisecond: 0 });
    return minute < 30
      ? dt.set({ minute: 30, second: 0, millisecond: 0 })
      : dt.plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 });
  },

  /**
   * FINANCIAL PERIODS: Logic for Revenue dashboard
   */
  isWithinPeriod(date: Date | string, period: 'today' | 'week' | 'month' | 'all', zone: string = VICTORIA_TZ): boolean {
    if (period === 'all') return true;
    const dt = date instanceof Date ? DateTime.fromJSDate(date) : DateTime.fromISO(date);
    const now = DateTime.now().setZone(zone);
    
    if (period === 'today') return dt.hasSame(now, 'day');
    if (period === 'week') return dt >= now.startOf('week') && dt <= now.endOf('week');
    if (period === 'month') return dt.hasSame(now, 'month');
    
    return true;
  }
};
