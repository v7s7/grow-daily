/**
 * dateUtils.js — single source of truth for all date strings in GrowDaily.
 *
 * Rule: every date key written to Firestore or localStorage MUST come from
 * getLocalDateStr(). Never call toISOString().split("T")[0] anywhere else
 * in the codebase — that returns the UTC date, which differs from the user's
 * local calendar date for anyone east of UTC (e.g. at 11 PM in UTC+3 the UTC
 * date is still "yesterday", silently breaking streak logic).
 */

/**
 * Returns today's date as "YYYY-MM-DD" in the device's local timezone.
 * The "en-CA" locale is used because it always formats as YYYY-MM-DD
 * regardless of the runtime locale, giving a stable, sortable key.
 *
 * @param {Date} [date=new Date()] — pass a specific Date to format
 * @returns {string} e.g. "2025-06-02"
 */
export const getLocalDateStr = (date = new Date()) =>
  date.toLocaleDateString("en-CA");

/**
 * Returns yesterday's date as "YYYY-MM-DD" in local timezone.
 *
 * Uses calendar-date arithmetic (year/month/day - 1) rather than
 * subtracting 86 400 000 ms, which is wrong on Daylight Saving Time
 * transition days (the day is 23 or 25 hours long).
 *
 * @param {Date} [date=new Date()] — anchor date (defaults to today)
 * @returns {string} e.g. "2025-06-01"
 */
export const getYesterdayStr = (date = new Date()) => {
  const y = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  return y.toLocaleDateString("en-CA");
};

/**
 * Returns a Date object for 00:01:00 the next calendar day in local time.
 * Used to schedule the midnight streak-check timer.
 *
 * @param {Date} [now=new Date()]
 * @returns {Date}
 */
export const getNextMidnight = (now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 0);
