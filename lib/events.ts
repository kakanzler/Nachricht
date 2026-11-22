import raw from "@/data/events.json";
import { EventsSchema, type EventItem } from "./schema";

/** Parsed at build time: invalid data fails the build instead of shipping. */
export function loadEvents(): EventItem[] {
  const parsed = EventsSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`data/events.json is invalid:\n${parsed.error.message}`);
  }
  return [...parsed.data].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}
