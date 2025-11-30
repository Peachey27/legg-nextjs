import type { Day } from '@/types';
import { WEEKS_AHEAD, WEEKS_BACK } from '@/lib/constants';

const PAST_DAYS = WEEKS_BACK * 7;
const TOTAL_DAYS_FORWARD = WEEKS_AHEAD * 7;

export function startOfThisWeekMonday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon ...
  const diffToMonday = (day + 6) % 7; // 0 if Mon, 1 if Tue, ...
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - diffToMonday
  );
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function isSameDayISO(dayId: string, date: Date): boolean {
  return dayId === date.toISOString().slice(0, 10);
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDayLabel(d: Date): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[d.getDay()];
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${dayName} ~ ${dd}/${mm}`;
}

export function toISODateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isSaturdayId(dayId: string | null): boolean {
  if (!dayId) return false;
  const parsed = new Date(dayId);
  return parsed.getDay() === 6;
}

export function generateDays(startMonday: Date, includeSaturday: boolean): Day[] {
  const arr: Day[] = [];

  for (let i = -PAST_DAYS; i < TOTAL_DAYS_FORWARD; i++) {
    const date = addDays(startMonday, i);
    const weekday = date.getDay(); // 0 = Sun, 1-5 = Mon-Fri, 6 = Sat

    if (weekday === 0) continue; // skip Sunday
    if (weekday === 6 && !includeSaturday) continue; // Saturday optional

    const isFriday = weekday === 5;
    const isSaturday = weekday === 6;

    arr.push({
      id: toISODateString(date),
      date,
      label: formatDayLabel(date),
      isFriday,
      isSaturday,
    });
  }

  return arr;
}

export function getPreviousFriday(from: Date): Date {
  const d = new Date(from);
  do {
    d.setDate(d.getDate() - 1);
  } while (d.getDay() !== 5);
  return d;
}

export function getCurrentTimeLinePosition(): number | null {
  const now = new Date();
  const day = now.getDay();

  // Only show on weekdays
  if (day === 0 || day === 6) return null;

  const hour = now.getHours();
  const minute = now.getMinutes();

  // Work hours: 7am - 5pm (Mon-Thu) or 7am - 1pm (Fri)
  const startHour = 7;
  const endHour = day === 5 ? 13 : 17;

  if (hour < startHour || hour >= endHour) return null;

  const totalMinutes = (hour - startHour) * 60 + minute;
  const totalWorkMinutes = (endHour - startHour) * 60;

  return (totalMinutes / totalWorkMinutes) * 100;
}
