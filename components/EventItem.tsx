"use client";

import { useId, useState } from "react";
import { downloadIcs, googleCalendarUrl } from "@/lib/calendar";
import { timeRange } from "@/lib/date";
import type { EventItem as Ev } from "@/lib/schema";
import { useI18n } from "./I18n";
import { ModePill, TagPill } from "./Pill";

type Props = {
  event: Ev;
  day: number;
  weekday: string;
  activeTags: Set<string>;
  onTagClick: (tag: string) => void;
};

const SOURCE_LABEL: Record<string, string> = {
  connpass: "connpass",
  codezine: "CodeZine",
  techplay: "TECH PLAY",
  doorkeeper: "Doorkeeper",
  "dev.events": "dev.events",
  "jaws-ug": "JAWS-UG",
  findy: "Findy Conference",
  "japan-it-week": "Japan IT Week",
};

export default function EventItem({ event: e, day, weekday, activeTags, onTagClick }: Props) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const source =
    e.source === "official" ? t.sourceOfficial : e.source === "sbbit" ? t.sourceSbbit : e.source && (SOURCE_LABEL[e.source] ?? e.source);
  const panelId = useId();

  const tags = e.tags.map((t) => <TagPill key={t} tag={t} active={activeTags.has(t)} onClick={() => onTagClick(t)} />);

  return (
    <article className="row-highlight rounded-2xl px-2 py-2.5">
      <div className="grid grid-cols-[2.75rem_1fr] gap-x-3 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-x-4">
        <div className="text-center leading-tight text-ink-soft">
          <div className="text-2xl sm:text-[1.7rem]">{day}</div>
          <div className="text-sm">{weekday}</div>
        </div>
        <div className="min-w-0">
          <div className={`text-sm ${e.timeTbd ? "text-[#b25a06]" : "text-ink-soft"}`}>{timeRange(e, locale)}</div>
          <a href={e.url} target="_blank" rel="noopener noreferrer" className="group block text-lg leading-snug text-ink sm:text-2xl">
            <span className="grad-accent bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]">
              {e.title}
            </span>
          </a>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <ModePill event={e} />
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="neu-raised-sm inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-0.5 text-xs text-ink-soft transition active:neu-inset sm:text-sm"
            >
              {t.details}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {e.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5 sm:hidden">{tags}</div>}
        </div>
        {e.tags.length > 0 && <div className="hidden flex-col items-end gap-2 sm:flex">{tags}</div>}
      </div>

      {open && (
        <div id={panelId} className="neu-inset mt-3 rounded-2xl p-4 text-sm text-ink-soft sm:ml-[4.5rem]">
          {e.description && <p className="mb-3 leading-relaxed text-ink">{e.description}</p>}
          <dl className="grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1">
            <dt className="text-ink-faint">{t.fieldDate}</dt>
            <dd>
              {timeRange(e, locale)}
              {e.timeTbd && <span className="ml-1 text-xs">{t.timeTbdNote}</span>}
            </dd>
            <dt className="text-ink-faint">{t.fieldMode}</dt>
            <dd>{t.modeLong[e.mode]}</dd>
            {e.venue && e.mode !== "online" && (
              <>
                <dt className="text-ink-faint">{t.fieldVenue}</dt>
                <dd>
                  {e.venue}
                  {e.venueTbd && <span className="ml-1 text-xs">{t.venueTbdNote}</span>}
                </dd>
              </>
            )}
            {source && (
              <>
                <dt className="text-ink-faint">{t.fieldSource}</dt>
                <dd>{source}</dd>
              </>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="grad-accent rounded-full px-4 py-1.5 text-sm font-medium text-white shadow-md">
              {t.officialPage}
            </a>
            <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="neu-raised-sm rounded-full px-4 py-1.5 text-sm text-ink-soft">
              {t.addGoogle}
            </a>
            <button type="button" onClick={() => downloadIcs(e)} className="neu-raised-sm cursor-pointer rounded-full px-4 py-1.5 text-sm text-ink-soft active:neu-inset">
              {t.downloadIcs}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
