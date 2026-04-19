/** UTC 日历日起始，用于跨日比较 */
export function startOfDayUtc(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

/** from 到 to 相差的日历天数（可为负） */
export function calendarDaysBetween(from: Date, to: Date): number {
  const a = startOfDayUtc(from).getTime();
  const b = startOfDayUtc(to).getTime();
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}
