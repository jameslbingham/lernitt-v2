// @ts-nocheck
import { DateTime } from 'luxon';
import { TimezoneEngine } from './timezoneUtil';

/**
 * Ported from v1 validateSlot.js
 * Slices available time ranges into bookable duration blocks.
 */
function sliceDaySlots(day: DateTime, ranges: any[], durMins: number) {
  const out = [];
  for (const r of ranges) {
    const s = day.set({ hour: parseInt(r.start.slice(0, 2)), minute: parseInt(r.start.slice(3)) });
    const e = day.set({ hour: parseInt(r.end.slice(0, 2)), minute: parseInt(r.end.slice(3)) });
    let cur = s;
    while (cur.plus({ minutes: durMins }) <= e) {
      out.push({ s: cur, e: cur.plus({ minutes: durMins }) });
      cur = cur.plus({ minutes: 30 }); // Hardcoded 30-min policy for slot steps
    }
  }
  return out;
}

/**
 * Validates if a requested slot is available and doesn't clash.
 */
export async function validateSlotForBooking(db: any, { tutorId, startISO, endISO, durMins }) {
  const { ObjectId } = require('mongodb');
  
  // 1. Fetch Availability
  const avail = await db.collection("availability").findOne({ tutor: new ObjectId(tutorId) });
  if (!avail) return { ok: false, reason: "no-availability" };

  const tutorTz = avail.timezone || "UTC";
  const startUTC = DateTime.fromISO(startISO, { zone: "utc" });
  const endUTC = DateTime.fromISO(endISO, { zone: "utc" });

  if (!startUTC.isValid || !endUTC.isValid) return { ok: false, reason: "bad-datetime" };

  // 2. Check Rules & Exceptions
  const day = startUTC.setZone(tutorTz).startOf("day");
  const isoDate = day.toISODate();
  const ex = (avail.exceptions || []).find(e => e.date === isoDate);
  let ranges = [];

  if (ex) {
    ranges = ex.open ? (ex.ranges || []) : [];
  } else {
    const dow = day.weekday === 7 ? 0 : day.weekday; // Sunday mapping
    const dayWeekly = (avail.weekly || []).find(w => w.dow === dow);
    ranges = dayWeekly ? dayWeekly.ranges : [];
  }

  // 3. Match against allowed blocks
  const blocks = sliceDaySlots(day, ranges, durMins).map(b => ({
    sUTC: b.s.toUTC().toISO(),
    eUTC: b.e.toUTC().toISO()
  }));

  const matches = blocks.some(b => b.sUTC === startUTC.toUTC().toISO());
  if (!matches) return { ok: false, reason: "not-in-availability" };

  // 4. Clash Guard with existing lessons
  const overlap = await db.collection("lessons").findOne({
    tutorId: tutorId,
    status: { $nin: ["cancelled", "expired"] },
    startTime: { $lt: new Date(endISO) },
    endTime: { $gt: new Date(startISO) }
  });

  if (overlap) return { ok: false, reason: "clash" };

  return { ok: true };
}
