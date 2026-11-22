import type { EventItem } from "./schema";

const TZ = "Asia/Tokyo";

const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export type JstParts = {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: string; // Mon, Tue...
  time: string; // HH:mm
  dateKey: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
};

export function jst(iso: string | number | Date): JstParts {
  const d = new Date(iso);
  const p = Object.fromEntries(partsFmt.formatToParts(d).map((x) => [x.type, x.value]));
  const year = Number(p.year);
  const month = Number(p.month);
  const day = Number(p.day);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return {
    year,
    month,
    day,
    weekday: p.weekday,
    time: `${p.hour}:${p.minute}`,
    dateKey: `${year}-${mm}-${dd}`,
    monthKey: `${year}-${mm}`,
  };
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthShort = (m: number) => MONTH_SHORT[m - 1];

export function timeRange(e: EventItem): string {
  const s = jst(e.start);
  if (!e.end) return s.time;
  const t = jst(e.end);
  return t.dateKey === s.dateKey ? `${s.time}~${t.time}` : `${s.time}~${t.month}/${t.day} ${t.time}`;
}

export type DayGroup = { dateKey: string; day: number; weekday: string; events: EventItem[] };
export type MonthGroup = { monthKey: string; year: number; month: number; days: DayGroup[] };

/** Events must be sorted by start. */
export function groupByMonthDay(events: EventItem[]): MonthGroup[] {
  const months: MonthGroup[] = [];
  for (const e of events) {
    const p = jst(e.start);
    let m = months.at(-1);
    if (!m || m.monthKey !== p.monthKey) {
      m = { monthKey: p.monthKey, year: p.year, month: p.month, days: [] };
      months.push(m);
    }
    let d = m.days.at(-1);
    if (!d || d.dateKey !== p.dateKey) {
      d = { dateKey: p.dateKey, day: p.day, weekday: p.weekday, events: [] };
      m.days.push(d);
    }
    d.events.push(e);
  }
  return months;
}
