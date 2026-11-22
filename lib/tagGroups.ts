// Tag → category used to group the filter UI. Tags not listed fall into "その他".
// Keep in sync with .claude/skills/collect-events/SKILL.md (tag vocabulary).
export const TAG_GROUPS: { label: string; tags: string[] }[] = [
  {
    label: "クラウド・インフラ",
    tags: ["Cloud", "AWS", "Azure", "Google Cloud", "Infrastructure", "Kubernetes", "SRE", "Linux", "Network", "Database"],
  },
  { label: "AI・データ", tags: ["AI", "MLOps", "Data"] },
  { label: "セキュリティ", tags: ["Security", "Compliance"] },
  {
    label: "言語・開発",
    tags: ["Frontend", "Backend", "Architecture", "Mobile", "Ruby", "PHP", "Python", "Go", "Java", "Perl", "Blockchain", "OSS"],
  },
  { label: "組織・キャリア", tags: ["Agile", "Management", "Career", "Design", "Corporate IT", "Community"] },
];

const index = new Map(TAG_GROUPS.flatMap((g) => g.tags.map((t) => [t.toLowerCase(), g.label] as const)));

export function groupTags(tags: string[]): { label: string; tags: string[] }[] {
  const buckets = new Map<string, string[]>();
  for (const t of tags) {
    const label = index.get(t.toLowerCase()) ?? "その他";
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push(t);
  }
  const order = [...TAG_GROUPS.map((g) => g.label), "その他"];
  return order.filter((l) => buckets.has(l)).map((label) => ({ label, tags: buckets.get(label)!.sort() }));
}
