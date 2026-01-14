// src/lib/utils/timezone.ts
import { DateTime } from 'luxon';

export const TimeZoneEngine = {
  convertToUTC(date: string, time: string, zone: string): Date {
    return DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm', { zone })
      .toUTC()
      .toJSDate();
  },

  formatToLocal(utcDate: Date, zone: string, format: string = 'HH:mm'): string {
    return DateTime.fromJSDate(utcDate).setZone(zone).toFormat(format);
  },

  snapToPolicy(dt: DateTime) {
    const minute = dt.minute;
    if (minute === 0 || minute === 30) return dt.set({ second: 0, millisecond: 0 });
    return minute < 30
      ? dt.set({ minute: 30, second: 0, millisecond: 0 })
      : dt.plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 });
  },

  generateBookableSlots(day: DateTime, ranges: {startTime: string, endTime: string}[], duration: number, interval: number) {
    const slots: string[] = [];
    for (const range of ranges) {
      let current = this.snapToPolicy(day.set({
        hour: parseInt(range.startTime.split(':')[0]),
        minute: parseInt(range.startTime.split(':')[1]),
      }));
      const end = day.set({
        hour: parseInt(range.endTime.split(':')[0]),
        minute: parseInt(range.endTime.split(':')[1]),
      });
      while (current.plus({ minutes: duration }) <= end) {
        slots.push(current.toUTC().toISO()!);
        current = this.snapToPolicy(current.plus({ minutes: interval }));
      }
    }
    return slots;
  }
};
