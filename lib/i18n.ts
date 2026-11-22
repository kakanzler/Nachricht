import type { EventMode } from "./schema";

export type Locale = "ja" | "en";
export const LOCALES: { id: Locale; short: string; name: string }[] = [
  { id: "ja", short: "JP", name: "日本語" },
  { id: "en", short: "EN", name: "English" },
];
export const isLocale = (v: unknown): v is Locale => v === "ja" || v === "en";

type Dict = {
  tagline: string;
  calendarOpen: string;
  calendarClose: string;
  showing: (n: number, total: number) => string;
  searchLabel: string;
  searchPlaceholder: string;
  noResults: string;
  monthLabel: (year: number, month: number) => string;
  details: string;
  fieldDate: string;
  fieldMode: string;
  fieldVenue: string;
  fieldSource: string;
  timeTbdNote: string;
  venueTbdNote: string;
  modeLong: Record<EventMode, string>;
  venueTbd: string;
  officialPage: string;
  addGoogle: string;
  downloadIcs: string;
  sourceOfficial: string;
  sourceSbbit: string;
  filter: string;
  filterMode: string;
  filterTags: string;
  selectAll: string;
  deselect: string;
  showPast: string;
  clear: string;
  calTitle: (year: number, month: number) => string;
  week: string[];
  prevMonth: string;
  nextMonth: string;
  hasEvents: string;
  language: string;
};

const ja: Dict = {
  tagline: "IT Event Portal",
  calendarOpen: "カレンダー",
  calendarClose: "閉じる",
  showing: (n, total) => `${n} / ${total} 件を表示中`,
  searchLabel: "イベントを検索",
  searchPlaceholder: "Search for ...",
  noResults: "条件に一致するイベントはありません",
  monthLabel: (y, m) => `${y}年${m}月`,
  details: "詳細",
  fieldDate: "日時",
  fieldMode: "形式",
  fieldVenue: "会場",
  fieldSource: "情報元",
  timeTbdNote: "（日付のみ確認済み。公式サイトで時刻を確認してください）",
  venueTbdNote: "（詳細な会場は未確認）",
  modeLong: { offline: "現地開催", online: "オンライン", hybrid: "ハイブリッド（現地＋オンライン）" },
  venueTbd: "（会場未定）",
  officialPage: "公式ページ",
  addGoogle: "Google カレンダーに追加",
  downloadIcs: ".ics をダウンロード",
  sourceOfficial: "公式サイト",
  sourceSbbit: "ビジネス+IT",
  filter: "フィルター",
  filterMode: "開催形式",
  filterTags: "タグ",
  selectAll: "すべて選択",
  deselect: "解除",
  showPast: "過去のイベントも表示",
  clear: "条件をクリア",
  calTitle: (y, m) => `${y}年 ${m}月`,
  week: ["日", "月", "火", "水", "木", "金", "土"],
  prevMonth: "前の月",
  nextMonth: "次の月",
  hasEvents: "（イベントあり）",
  language: "表示言語",
};

const MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const en: Dict = {
  tagline: "IT Event Portal",
  calendarOpen: "Calendar",
  calendarClose: "Close",
  showing: (n, total) => `Showing ${n} of ${total} events`,
  searchLabel: "Search events",
  searchPlaceholder: "Search for ...",
  noResults: "No events match your filters",
  monthLabel: (y, m) => `${MONTH_LONG[m - 1]} ${y}`,
  details: "Details",
  fieldDate: "When",
  fieldMode: "Format",
  fieldVenue: "Venue",
  fieldSource: "Source",
  timeTbdNote: "(Only the date is confirmed — check the official site for times.)",
  venueTbdNote: "(Exact venue not confirmed)",
  modeLong: { offline: "In person", online: "Online", hybrid: "Hybrid (in person + online)" },
  venueTbd: " (venue TBD)",
  officialPage: "Official page",
  addGoogle: "Add to Google Calendar",
  downloadIcs: "Download .ics",
  sourceOfficial: "Official site",
  sourceSbbit: "Business+IT",
  filter: "Filters",
  filterMode: "Format",
  filterTags: "Tags",
  selectAll: "Select all",
  deselect: "Clear",
  showPast: "Show past events",
  clear: "Clear filters",
  calTitle: (y, m) => `${MONTH_LONG[m - 1]} ${y}`,
  week: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  prevMonth: "Previous month",
  nextMonth: "Next month",
  hasEvents: " (has events)",
  language: "Language",
};

export const DICT: Record<Locale, Dict> = { ja, en };
