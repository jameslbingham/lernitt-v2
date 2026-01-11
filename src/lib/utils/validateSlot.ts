// @ts-nocheck
import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { DateTime } from 'luxon';

/**
 * Ported v1 Slot Validator:
 * Ensures bookings match tutor availability and do not clash.
 */

function sliceDaySlots(day: any, ranges: any[], durMins: number) {
  const out = [];
  for (const r of ranges) {
    // Ensuring numeric conversion for HH:mm slicing as per v1 fix
    const s = day.set({ hour: +r.start.slice(0, 2), minute: +r.start.slice(3) });
    const e = day.set({ hour: +r.end.slice(0, 2), minute: +r.end.slice(3) });
    let cur = s;
    while (cur.plus({ minutes: durMins }) <= e) {
      out.push({ s: cur, e: cur.plus({ minutes: durMins }) });
      cur = cur.plus({ minutes: durMins });
    }
  }
  return out;
}

export async function validateSlot({ tutorId, startISO, endISO, durMins }: any) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  // 1. Fetch Availability (Matches v1 'tutor' field)
  const avail = await db.collection('availabilities').findOne({ tutor: new ObjectId(tutorId) });
  if (!avail) return { ok: false, reason: "no-availability" };

  const tutorTz = avail.timezone || "UTC";
  const startUTC = DateTime.fromISO(startISO, { zone: "utc" });
  const endUTC = DateTime.fromISO(endISO, { zone: "utc" });
  
  if (!startUTC.isValid || !endUTC.isValid) return { ok: false, reason: "bad-datetime" };

  // 2. Convert to tutor’s local day for rules lookup
  const day = startUTC.setZone(tutorTz).startOf("day");
  const isoDate = day.toISODate();

  const ex = (avail.exceptions || []).find((e: any) => e.date === isoDate);
  let ranges = [];
  
  if (ex) {
    // Matches ExceptionSchema 'ranges'
    ranges = ex.open ? (ex.ranges || []) : []; 
  } else {
    // Convert Luxon Sunday (7) to DB Sunday (0)
    const dow = day.weekday === 7 ? 0 : day.weekday; 
    const dayWeekly = (avail.weekly || []).find((w: any) => w.dow === dow);
    ranges = dayWeekly ? dayWeekly.ranges : [];
  }

  // 3. Make allowed blocks and check for exact match
  const blocks = sliceDaySlots(day, ranges, durMins).map(b => ({
    sUTC: b.s.toUTC(),
    eUTC: b.e.toUTC(),
  }));

  const matches = blocks.some(b => 
    b.sUTC.hasSame(startUTC, 'millisecond') && b.eUTC.hasSame(endUTC, 'millisecond')
  );
  
  if (!matches) return { ok: false, reason: "not-in-availability" };

  // 4. Clash check with existing lessons (Excluding cancelled/expired)
  const overlap = await db.collection('lessons').findOne({
    tutor: new ObjectId(tutorId),
    status: { $nin: ["cancelled", "expired"] },
    startTime: { $lt: endUTC.toJSDate() },
    endTime: { $gt: startUTC.toJSDate() },
  });
  
  if (overlap) return { ok: false, reason: "clash" };

  return { ok: true };
}
