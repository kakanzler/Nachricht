import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { EventsSchema } from "../lib/schema";

const file = resolve(process.argv[2] ?? "data/events.json");
let json: unknown;
try {
  json = JSON.parse(readFileSync(file, "utf8"));
} catch (err) {
  console.error(`✗ ${file}: cannot read/parse JSON\n  ${(err as Error).message}`);
  process.exit(1);
}
const result = EventsSchema.safeParse(json);
if (!result.success) {
  console.error(`✗ ${file}: schema errors`);
  for (const issue of result.error.issues) {
    console.error(`  [${issue.path.join(".")}] ${issue.message}`);
  }
  process.exit(1);
}
console.log(`✓ ${file}: ${result.data.length} events OK`);
