import Portal from "@/components/Portal";
import { loadEvents } from "@/lib/events";

export default function Home() {
  const events = loadEvents();
  return <Portal events={events} />;
}
