"use client";

import { useEffect, useRef, useState } from "react";
import type { EventMode } from "@/lib/schema";
import { groupTags } from "@/lib/tagGroups";
import { TagPill } from "./Pill";

const MODES: EventMode[] = ["offline", "online", "hybrid"];

type Props = {
  allTags: string[];
  tags: Set<string>;
  modes: Set<EventMode>;
  showPast: boolean;
  onToggleTag: (t: string) => void;
  onSetTags: (tags: string[], on: boolean) => void;
  onToggleMode: (m: EventMode) => void;
  onShowPast: (v: boolean) => void;
  onClear: () => void;
};

export default function FilterPopover(p: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeCount = p.tags.size + p.modes.size + (p.showPast ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="フィルター"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition ${
          open ? "neu-inset" : "neu-raised-sm"
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <defs>
            <linearGradient id="fg" gradientUnits="userSpaceOnUse" x1="3" y1="0" x2="21" y2="0">
              <stop offset="0%" stopColor="#ff6000" />
              <stop offset="51%" stopColor="#f022a3" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <g stroke={activeCount ? "url(#fg)" : "var(--ink-soft)"}>
            <path d="M3 6h18" />
            <path d="M6 12h12" />
            <path d="M10 18h4" />
          </g>
        </svg>
        {activeCount > 0 && (
          <span className="grad-accent absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="neu-raised absolute right-0 z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-3xl p-5">
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-ink-faint uppercase">開催形式</h3>
          <div className="mb-4 flex gap-2">
            {MODES.map((m) => {
              const on = p.modes.has(m);
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={on}
                  onClick={() => p.onToggleMode(m)}
                  className={`flex-1 cursor-pointer rounded-full py-1.5 text-sm transition ${
                    on ? "grad-accent text-white shadow-md" : "neu-raised-sm text-ink-soft"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <h3 className="mb-2 text-xs font-semibold tracking-wider text-ink-faint uppercase">タグ</h3>
          <div className="mb-4 max-h-[min(22rem,50vh)] space-y-3 overflow-y-auto p-1">
            {groupTags(p.allTags).map((g) => {
              const allOn = g.tags.every((t) => p.tags.has(t));
              return (
                <div key={g.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-soft">{g.label}</span>
                    <button
                      type="button"
                      onClick={() => p.onSetTags(g.tags, !allOn)}
                      className="cursor-pointer text-[11px] text-ink-faint underline-offset-2 hover:underline"
                    >
                      {allOn ? "解除" : "すべて選択"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {g.tags.map((t) => (
                      <TagPill key={t} tag={t} active={p.tags.has(t)} onClick={() => p.onToggleTag(t)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <label className="mb-4 flex cursor-pointer items-center justify-between text-sm text-ink-soft">
            過去のイベントも表示
            <span className="relative inline-flex">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={p.showPast}
                onChange={(e) => p.onShowPast(e.target.checked)}
              />
              <span className="neu-inset block h-6 w-11 rounded-full transition peer-checked:[background-image:var(--grad-primary)]" />
              <span className="neu-raised-sm absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition peer-checked:translate-x-5" />
            </span>
          </label>

          <button
            type="button"
            onClick={p.onClear}
            disabled={activeCount === 0}
            className="neu-raised-sm w-full cursor-pointer rounded-full py-2 text-sm text-ink-soft transition active:neu-inset disabled:cursor-default disabled:opacity-40"
          >
            条件をクリア
          </button>
        </div>
      )}
    </div>
  );
}
