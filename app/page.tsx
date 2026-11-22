import { cacheLife } from "next/cache";
import Portal from "@/components/Portal";
import { isPast, todayKey } from "@/lib/date";
import { loadEvents } from "@/lib/events";
import type { EventItem } from "@/lib/schema";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Re-rendered at most hourly, so finished events drop out of the HTML
// without a redeploy (the client re-checks "today" on load as well).
export default async function Home() {
  "use cache";
  cacheLife("hours");

  const events = loadEvents();
  const today = todayKey();
  const upcoming = events.filter((e) => !isPast(e, today));

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output is safe here apart from "</script>", which we escape.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(upcoming)).replace(/</g, "\\u003c") }}
      />
      <Portal events={events} serverToday={today} />
    </>
  );
}

function jsonLd(events: EventItem[]) {
  const attendance = {
    offline: "https://schema.org/OfflineEventAttendanceMode",
    online: "https://schema.org/OnlineEventAttendanceMode",
    hybrid: "https://schema.org/MixedEventAttendanceMode",
  } as const;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} — IT Event Portal`,
    url: SITE_URL,
    itemListElement: events.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Event",
        name: e.title,
        url: e.url,
        startDate: e.timeTbd ? e.start.slice(0, 10) : e.start,
        ...(e.end ? { endDate: e.timeTbd ? e.end.slice(0, 10) : e.end } : {}),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: attendance[e.mode],
        location:
          e.mode === "online"
            ? { "@type": "VirtualLocation", url: e.url }
            : { "@type": "Place", name: e.venue ?? "未定", address: e.venue ?? "日本" },
        ...(e.description ? { description: e.description } : {}),
      },
    })),
  };
}
