"use client";

import { Fragment } from "react";
import { groupByMonthDay, monthShort } from "@/lib/date";
import type { EventItem as Ev } from "@/lib/schema";
import EventItem from "./EventItem";
import { useI18n } from "./I18n";

type Props = {
  events: Ev[];
  selectedDate: string | null;
  activeTags: Set<string>;
  onTagClick: (tag: string) => void;
};

export default function EventList({ events, selectedDate, activeTags, onTagClick }: Props) {
  const { t } = useI18n();
  const months = groupByMonthDay(events);

  if (months.length === 0) {
    return <p className="px-6 py-24 text-center text-ink-faint">{t.noResults}</p>;
  }

  return (
    <div>
      {months.map((m, mi) => (
        <section
          key={m.monthKey}
          aria-label={t.monthLabel(m.year, m.month)}
          className={`min-h-[45vh] px-4 py-5 sm:px-6 ${mi > 0 ? "border-t border-dashed border-rule" : ""}`}
        >
          <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-[4.5rem_1fr] sm:gap-x-2">
            <h2 className="text-2xl leading-tight text-ink-soft sm:pt-1 sm:text-[1.7rem]">
              {monthShort(m.month)}
              <span className="ml-2 text-xs text-ink-faint sm:ml-0 sm:block">{m.year}</span>
            </h2>
            <div className="min-w-0">
              {m.days.map((d, di) => (
                <Fragment key={d.dateKey}>
                  {di > 0 && <div className="rule-dots my-3" aria-hidden />}
                  <div
                    id={`day-${d.dateKey}`}
                    className={`scroll-mt-28 rounded-2xl transition-shadow duration-300 ${selectedDate === d.dateKey ? "neu-inset" : ""}`}
                  >
                    {d.events.map((e, ei) => (
                      <Fragment key={e.id}>
                        {ei > 0 && <div className="rule-dots mx-1 my-1" aria-hidden />}
                        <EventItem event={e} day={d.day} weekday={d.weekday} activeTags={activeTags} onTagClick={onTagClick} />
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
