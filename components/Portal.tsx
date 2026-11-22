"use client";

import { useEffect, useMemo, useState } from "react";
import { jst } from "@/lib/date";
import type { EventItem, EventMode } from "@/lib/schema";
import EventList from "./EventList";
import FilterPopover from "./FilterPopover";
import MiniCalendar from "./MiniCalendar";

const toggle = <T,>(set: Set<T>, v: T) => {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
};

export default function Portal({ events }: { events: EventItem[] }) {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [modes, setModes] = useState<Set<EventMode>>(new Set());
  const [showPast, setShowPast] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [calOpen, setCalOpen] = useState(false);

  // "today" is only known in the browser; the prerendered HTML shows every event.
  const [today, setToday] = useState<string | null>(null);
  const initial = jst(events[0]?.start ?? "2026-01-01T00:00:00+09:00");
  const [cal, setCal] = useState({ year: initial.year, month: initial.month });

  useEffect(() => {
    const t = jst(Date.now());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only clock, unavailable during prerender
    setToday(t.dateKey);
    setCal({ year: t.year, month: t.month });
  }, []);

  const allTags = useMemo(
    () => [...new Set(events.flatMap((e) => e.tags))].sort((a, b) => a.localeCompare(b)),
    [events],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (!showPast && today && jst(e.end ?? e.start).dateKey < today) return false;
      if (modes.size && !modes.has(e.mode)) return false;
      if (tags.size && !e.tags.some((t) => tags.has(t))) return false;
      if (q) {
        const hay = [e.title, e.venue ?? "", e.description ?? "", ...e.tags].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, query, tags, modes, showPast, today]);

  const eventDays = useMemo(() => new Set(events.map((e) => jst(e.start).dateKey)), [events]);

  const selectDate = (dateKey: string) => {
    setSelected(dateKey);
    if (today && dateKey < today) setShowPast(true);
    // Jump to that day, or the next day that has a visible event.
    requestAnimationFrame(() => {
      const target =
        document.getElementById(`day-${dateKey}`) ??
        [...document.querySelectorAll<HTMLElement>("[id^='day-']")].find((el) => el.id.slice(4) >= dateKey);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl md:grid md:grid-cols-[17rem_1fr]">
      <aside className="border-rule px-4 pt-5 md:sticky md:top-0 md:h-screen md:border-r md:px-5">
        <div className="flex items-center justify-between md:block">
          <h1 className="grad-text text-3xl font-bold tracking-tight md:mb-1">Nachricht</h1>
          <button
            type="button"
            className="neu-raised-sm cursor-pointer rounded-full px-4 py-1.5 text-sm text-ink-soft md:hidden"
            aria-expanded={calOpen}
            onClick={() => setCalOpen((v) => !v)}
          >
            {calOpen ? "閉じる" : "カレンダー"}
          </button>
        </div>
        <p className="hidden text-xs text-ink-faint md:block">IT Event Portal</p>
        <div className={`${calOpen ? "block" : "hidden"} mt-4 md:mt-8 md:block`}>
          <MiniCalendar
            year={cal.year}
            month={cal.month}
            today={today}
            selected={selected}
            eventDays={eventDays}
            onMonthChange={(year, month) => setCal({ year, month })}
            onSelect={(k) => {
              selectDate(k);
              setCalOpen(false);
            }}
          />
          <p className="mt-6 hidden text-xs leading-relaxed text-ink-faint md:block">
            {events.length} 件のイベントを掲載中
          </p>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-rule bg-surface/90 px-4 py-4 backdrop-blur sm:px-6">
          <label className="neu-inset flex h-11 max-w-md flex-1 items-center gap-2 rounded-full px-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <span className="sr-only">イベントを検索</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for ..."
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </label>
          <FilterPopover
            allTags={allTags}
            tags={tags}
            modes={modes}
            showPast={showPast}
            onToggleTag={(t) => setTags((s) => toggle(s, t))}
            onToggleMode={(m) => setModes((s) => toggle(s, m))}
            onShowPast={setShowPast}
            onClear={() => {
              setTags(new Set());
              setModes(new Set());
              setShowPast(false);
            }}
          />
        </header>

        <EventList
          events={visible}
          selectedDate={selected}
          activeTags={tags}
          onTagClick={(t) => setTags((s) => toggle(s, t))}
        />
      </main>
    </div>
  );
}
