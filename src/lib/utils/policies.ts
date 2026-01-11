// @ts-nocheck
/**
 * Lernitt-v2 Core Policies:
 * Ported from v1 to ensure business continuity.
 */

export const Policies = {
  /**
   * The 24-Hour Rule: Lessons cannot be changed within 24 hours of start.
   * Logic: (StartTime - Now) / 36e5 (hours) >= 24.
   */
  canReschedule: (startTime: Date, now: Date = new Date()): boolean => {
    if (!startTime) return false;
    const diffInHours = (new Date(startTime).getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours >= 24; 
  },

  /**
   * Platform Refund Policy: Standard is false.
   */
  refundAllowed: (): boolean => {
    return false; 
  }
};
