import { jst } from "./date";
import type { EventItem } from "./schema";

const utcStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** All-day range in JST (end is exclusive), used when clock times are unconfirmed. */
function allDayRange(e: EventItem): [string, string] {
  const s = jst(e.start);
  const last = jst(e.end ?? e.start);
  const next = new Date(Date.UTC(last.year, last.month - 1, last.day + 1));
  const ymd = (y: number, m: number, d: number) => `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
  return [ymd(s.year, s.month, s.day), ymd(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())];
}

function timedRange(e: EventItem): [string, string] {
  const end = e.end ?? new Date(Date.parse(e.start) + 60 * 60 * 1000).toISOString();
  return [utcStamp(e.start), utcStamp(end)];
}

const location = (e: EventItem) => (e.mode === "online" ? "オンライン" : (e.venue ?? ""));
const details = (e: EventItem) => [e.description, e.url].filter(Boolean).join("\n\n");

export function googleCalendarUrl(e: EventItem): string {
  const [a, b] = e.timeTbd ? allDayRange(e) : timedRange(e);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${a}/${b}`,
    details: details(e),
    location: location(e),
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

const icsEscape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** RFC 5545 lines must be folded at 75 octets. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = "";
    }
    cur += ch;
  }
  out.push(cur);
  return out.join("\r\n ");
}

export function icsContent(e: EventItem, now: number = Date.now()): string {
  const [a, b] = e.timeTbd ? allDayRange(e) : timedRange(e);
  const dt = e.timeTbd
    ? [`DTSTART;VALUE=DATE:${a}`, `DTEND;VALUE=DATE:${b}`]
    : [`DTSTART:${a}`, `DTEND:${b}`];
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nachricht//IT Event Portal//JA",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.id}@nachricht`,
    `DTSTAMP:${utcStamp(new Date(now).toISOString())}`,
    ...dt,
    `SUMMARY:${icsEscape(e.title)}`,
    `DESCRIPTION:${icsEscape(details(e))}`,
    `LOCATION:${icsEscape(location(e))}`,
    `URL:${e.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(e: EventItem) {
  const blob = new Blob([icsContent(e)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
