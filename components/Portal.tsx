"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isPast, jst, todayKey } from "@/lib/date";
import type { EventItem, EventMode } from "@/lib/schema";
import EventList from "./EventList";
import FilterPopover from "./FilterPopover";
import MiniCalendar from "./MiniCalendar";

const MODES: EventMode[] = ["offline", "online", "hybrid"];

const toggle = <T,>(set: Set<T>, v: T) => {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
};

const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

type Props = { events: EventItem[]; serverToday: string };

export default function Portal({ events, serverToday }: Props) {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [modes, setModes] = useState<Set<EventMode>>(new Set());
  const [showPast, setShowPast] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  // Starts as the server's "today" so the prerendered HTML already hides finished
  // events; refreshed from the browser clock after mount.
  const [today, setToday] = useState(serverToday);
  const t0 = jst(`${serverToday}T12:00:00+09:00`);
  const [cal, setCal] = useState({ year: t0.year, month: t0.month });
  const initDone = useRef(false);
  const [urlReady, setUrlReady] = useState(false);

  // Browser-only state: the real clock and filters encoded in the URL.
  // Runs once (guarded against StrictMode's double effect invocation).
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const now = todayKey();
    const p = new URLSearchParams(window.location.search);
    const date = p.get("date");
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from browser-only sources */
    setToday(now);
    setQuery(p.get("q") ?? "");
    setTags(new Set(list(p.get("tags"))));
    setModes(new Set(list(p.get("mode")).filter((m): m is EventMode => MODES.includes(m as EventMode))));
    setShowPast(p.get("past") === "1");
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setSelected(date);
      const d = jst(`${date}T12:00:00+09:00`);
      setCal({ year: d.year, month: d.month });
      requestAnimationFrame(() => document.getElementById(`day-${date}`)?.scrollIntoView({ block: "start" }));
    } else if (now !== serverToday) {
      const d = jst(Date.now());
      setCal({ year: d.year, month: d.month });
    }
    setUrlReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [serverToday]);

  // Keep the URL shareable: mirror filters into the query string
  // (only after the initial values have been read from it).
  useEffect(() => {
    if (!urlReady) return;
    const p = new URLSearchParams();
    if (query.trim()) p.set("q", query.trim());
    if (tags.size) p.set("tags", [...tags].join(","));
    if (modes.size) p.set("mode", [...modes].join(","));
    if (showPast) p.set("past", "1");
    if (selected) p.set("date", selected);
    const qs = p.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", next);
    }
  }, [urlReady, query, tags, modes, showPast, selected]);

  const allTags = useMemo(() => [...new Set(events.flatMap((e) => e.tags))], [events]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (!showPast && isPast(e, today)) return false;
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
    if (dateKey < today) setShowPast(true);
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
            {visible.length} / {events.length} 件を表示中
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
            onSetTags={(ts, on) =>
              setTags((s) => {
                const next = new Set(s);
                for (const t of ts) {
                  if (on) next.add(t);
                  else next.delete(t);
                }
                return next;
              })
            }
            onToggleMode={(m) => setModes((s) => toggle(s, m))}
            onShowPast={setShowPast}
            onClear={() => {
              setTags(new Set());
              setModes(new Set());
              setShowPast(false);
              setSelected(null);
            }}
          />
        </header>

        <EventList events={visible} selectedDate={selected} activeTags={tags} onTagClick={(t) => setTags((s) => toggle(s, t))} />
      </main>
    </div>
  );
}
