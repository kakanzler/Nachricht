"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DICT, isLocale, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "nachricht:lang";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (typeof DICT)[Locale] };
const I18nContext = createContext<Ctx>({ locale: "ja", setLocale: () => {}, t: DICT.ja });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Prerendered HTML is Japanese; the browser's choice (?lang= or the saved
  // preference) is applied after mount.
  const [locale, setLocaleState] = useState<Locale>("ja");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    const initial = isLocale(fromUrl) ? fromUrl : isLocale(saved) ? saved : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from browser-only sources
    if (initial) setLocaleState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  return <I18nContext.Provider value={{ locale, setLocale, t: DICT[locale] }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
