"use client";

import { Fragment } from "react";
import { groupByMonthDay, monthShort, timeRange } from "@/lib/date";
import type { EventItem } from "@/lib/schema";
import { ModePill, TagPill } from "./Pill";

type Props = {
  events: EventItem[];
  selectedDate: string | null;
  activeTags: Set<string>;
  onTagClick: (tag: string) => void;
};

export default function EventList({ events, selectedDate, activeTags, onTagClick }: Props) {
  const months = groupByMonthDay(events);

  if (months.length === 0) {
    return <p className="px-6 py-24 text-center text-ink-faint">条件に一致するイベントはありません</p>;
  }

  return (
    <div>
      {months.map((m, mi) => (
        <section
          key={m.monthKey}
          aria-label={`${m.year}年${m.month}月`}
          className={`min-h-[45vh] px-4 py-5 sm:px-6 ${mi > 0 ? "border-t border-dashed border-rule" : ""}`}
        >
          <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-[4.5rem_1fr] sm:gap-x-2">
            <h2 className="text-2xl leading-tight text-ink-soft sm:pt-1 sm:text-[1.7rem]">
              {monthShort(m.month)}
              <span className="ml-2 text-xs text-ink-faint sm:ml-0 sm:block">{m.year}</span>
            </h2>
            <div>
              {m.days.map((d, di) => (
                <Fragment key={d.dateKey}>
                  {di > 0 && <div className="rule-dots my-3" aria-hidden />}
                  <div
                    id={`day-${d.dateKey}`}
                    className={`scroll-mt-28 rounded-2xl transition-shadow duration-300 ${
                      selectedDate === d.dateKey ? "neu-inset" : ""
                    }`}
                  >
                    {d.events.map((e, ei) => (
                      <Fragment key={e.id}>
                        {ei > 0 && <div className="rule-dots mx-1 my-1" aria-hidden />}
                        <article className="grid grid-cols-[2.75rem_1fr] gap-x-3 px-2 py-2.5 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-x-4">
                          <div className="text-center leading-tight text-ink-soft">
                            <div className="text-2xl sm:text-[1.7rem]">{d.day}</div>
                            <div className="text-sm">{d.weekday}</div>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-ink-soft">{timeRange(e)}</div>
                            <a
                              href={e.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block text-lg leading-snug text-ink sm:text-2xl"
                            >
                              <span className="grad-accent bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]">
                                {e.title}
                              </span>
                            </a>
                            <div className="mt-1.5">
                              <ModePill event={e} />
                            </div>
                            {e.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5 sm:hidden">
                                {e.tags.map((t) => (
                                  <TagPill key={t} tag={t} active={activeTags.has(t)} onClick={() => onTagClick(t)} />
                                ))}
                              </div>
                            )}
                          </div>
                          {e.tags.length > 0 && (
                            <div className="hidden flex-col items-end gap-2 sm:flex">
                              {e.tags.map((t) => (
                                <TagPill key={t} tag={t} active={activeTags.has(t)} onClick={() => onTagClick(t)} />
                              ))}
                            </div>
                          )}
                        </article>
                      </Fragment>
                    ))}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
