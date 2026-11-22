"use client";

import { LOCALES } from "@/lib/i18n";
import { useI18n } from "./I18n";

export default function LangSwitch() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div role="group" aria-label={t.language} className="neu-inset flex h-11 shrink-0 items-center gap-1 rounded-full p-1">
      {LOCALES.map((l) => {
        const on = l.id === locale;
        return (
          <button
            key={l.id}
            type="button"
            lang={l.id}
            aria-label={l.name}
            aria-pressed={on}
            onClick={() => setLocale(l.id)}
            className={`h-9 min-w-10 cursor-pointer rounded-full px-2.5 text-xs font-semibold tracking-wide transition ${
              on ? "grad-accent text-white shadow-md" : "text-ink-soft hover:text-ink"
            }`}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
