/**
 * Date and Mass Schedule Utilities for SacristyConnect
 */

/**
 * Parses "YYYY-MM-DD" and optional "HH:MM" time string into a Date object.
 */
export function parseMassDateTime(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  let hours = 23;
  let minutes = 59;

  if (timeStr) {
    const match = timeStr.match(/(\d{1,2})[:.](\d{2})/);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
    }
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

/**
 * Checks whether a mass slot date and time has already passed.
 * @param dateStr ISO date string "YYYY-MM-DD"
 * @param timeStr e.g. "05:30 WIB" or "18:00"
 * @param graceMinutes Grace period in minutes after mass start (default: 120 = 2 hours)
 */
export function isMassPassed(dateStr: string, timeStr?: string, graceMinutes = 120): boolean {
  if (!dateStr) return false;

  const now = new Date();
  const massDate = parseMassDateTime(dateStr, timeStr);
  if (!massDate) return false;

  // Add grace period so an active mass in progress remains accessible
  const expirationTime = new Date(massDate.getTime() + graceMinutes * 60 * 1000);
  return now.getTime() > expirationTime.getTime();
}

/**
 * Returns the nearest upcoming or today's active slot from an array of ScheduleSlots.
 * If all slots are in the past, returns the latest slot or first slot as fallback.
 */
export function getNearestUpcomingSlot<T extends { id?: string; date: string; massTime?: string }>(
  slots: T[],
  graceMinutes = 120
): T | undefined {
  if (!slots || slots.length === 0) return undefined;

  // Find first non-passed slot
  const upcoming = slots.find(s => !isMassPassed(s.date, s.massTime, graceMinutes));
  if (upcoming) return upcoming;

  // If all are passed, return the most recent slot (last in sequence)
  return slots[slots.length - 1];
}
