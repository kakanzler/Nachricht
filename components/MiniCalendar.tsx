"use client";

type Props = {
  year: number;
  month: number; // 1-12
  today: string | null; // YYYY-MM-DD (JST)
  selected: string | null;
  eventDays: Set<string>;
  onMonthChange: (year: number, month: number) => void;
  onSelect: (dateKey: string) => void;
};

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

const key = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function MiniCalendar({ year, month, today, selected, eventDays, onMonthChange, onSelect }: Props) {
  // Pure calendar arithmetic in UTC so the host timezone never shifts days.
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1, 1 - firstDow + i));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    return { k: key(y, m, day), day, inMonth: m === month, dow: i % 7 };
  });

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month - 1 + delta, 1));
    onMonthChange(d.getUTCFullYear(), d.getUTCMonth() + 1);
  };

  return (
    <div className="neu-raised rounded-3xl p-4 select-none">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">
          {year}年 {month}月
        </span>
        <div className="flex gap-2">
          <NavBtn label="前の月" onClick={() => shift(-1)}>‹</NavBtn>
          <NavBtn label="次の月" onClick={() => shift(1)}>›</NavBtn>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
        {WEEK.map((w, i) => (
          <span key={w} className={`pb-1 ${i === 0 ? "text-[#e0568f]" : i === 6 ? "text-[#5b7cf0]" : "text-ink-faint"}`}>
            {w}
          </span>
        ))}
        {cells.map((c) => {
          const isToday = c.k === today;
          const isSel = c.k === selected;
          const has = eventDays.has(c.k);
          return (
            <button
              key={c.k}
              type="button"
              onClick={() => onSelect(c.k)}
              aria-label={`${c.k}${has ? "（イベントあり）" : ""}`}
              aria-pressed={isSel}
              className={`relative mx-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-xs transition ${
                isSel
                  ? "grad-accent font-semibold text-white shadow-md"
                  : isToday
                    ? "grad-primary font-semibold text-white shadow-md"
                    : c.inMonth
                      ? "text-ink hover:neu-raised-sm"
                      : "text-ink-faint/60 hover:neu-raised-sm"
              }`}
            >
              {c.day}
              {has && (
                <span
                  className={`absolute -bottom-0.5 h-1 w-1 rounded-full ${isSel || isToday ? "bg-white" : "grad-primary"}`}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="neu-raised-sm flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-ink-soft transition active:neu-inset"
    >
      {children}
    </button>
  );
}
