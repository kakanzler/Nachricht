import { z } from "zod";

const isoWithOffset = z.iso.datetime({ offset: true });

export const EventSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    url: z.url(),
    start: isoWithOffset,
    end: isoWithOffset.optional(),
    /** Only the date(s) are confirmed; start/end clock times are placeholders. */
    timeTbd: z.boolean().optional(),
    mode: z.enum(["offline", "online", "hybrid"]),
    venue: z.string().optional(),
    /** Only the city/area is known, not the exact venue. */
    venueTbd: z.boolean().optional(),
    tags: z.array(z.string().min(1)).default([]),
    source: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((e) => !e.end || Date.parse(e.end) >= Date.parse(e.start), {
    message: "end must not be before start",
    path: ["end"],
  });

export const EventsSchema = z.array(EventSchema).superRefine((list, ctx) => {
  const seen = new Set<string>();
  list.forEach((e, i) => {
    if (seen.has(e.id)) {
      ctx.addIssue({ code: "custom", message: `duplicate id "${e.id}"`, path: [i, "id"] });
    }
    seen.add(e.id);
  });
});

export type EventItem = z.infer<typeof EventSchema>;
export type EventMode = EventItem["mode"];
