"use client";

import type { CSSProperties } from "react";
import type { EventItem } from "@/lib/schema";
import { tagColor } from "@/lib/tagColor";
import { useI18n } from "./I18n";

const MODE_STYLE: Record<EventItem["mode"], string> = {
  offline: "bg-[#dbe7f6] text-[#2350c8] border-[#5b8be6]",
  online: "bg-[#fde7d3] text-[#b25a06] border-[#f59a3c]",
  hybrid: "bg-[#ece4fd] text-[#6a35d6] border-[#9b74f2]",
};

export function ModePill({ event }: { event: EventItem }) {
  const { t } = useI18n();
  const venue = event.venue && event.venueTbd ? `${event.venue}${t.venueTbd}` : event.venue;
  const label = venue && event.mode !== "online" ? `${event.mode} @ ${venue}` : event.mode;
  return (
    <span
      className={`inline-block max-w-full truncate rounded-full border px-3 py-0.5 text-xs font-medium sm:text-sm ${MODE_STYLE[event.mode]}`}
    >
      {label}
    </span>
  );
}

type TagPillProps = { tag: string; active?: boolean; onClick?: () => void };

export function TagPill({ tag, active, onClick }: TagPillProps) {
  const c = tagColor(tag);
  const style = {
    backgroundColor: c.bg,
    color: c.fg,
    borderColor: c.ring,
    "--tw-ring-color": c.ring,
  } as CSSProperties;
  const cls = `inline-flex items-center whitespace-nowrap rounded-full border px-3 py-0.5 text-xs font-medium transition sm:text-sm ${
    active ? "ring-2 ring-offset-2 ring-offset-[var(--surface)]" : ""
  }`;
  if (!onClick) {
    return (
      <span className={cls} style={style}>
        {tag}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${cls} cursor-pointer hover:brightness-95`} style={style} aria-pressed={!!active}>
      {tag}
    </button>
  );
}
