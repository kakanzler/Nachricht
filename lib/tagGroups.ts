// Tag → category used to group the filter UI. Tags not listed fall into "その他".
// Keep in sync with .claude/skills/collect-events/SKILL.md (tag vocabulary).
export const TAG_GROUPS: { label: string; labelEn: string; tags: string[] }[] = [
  {
    label: "クラウド・インフラ",
    labelEn: "Cloud & Infra",
    tags: ["Cloud", "AWS", "Azure", "Google Cloud", "Infrastructure", "Kubernetes", "SRE", "Linux", "Network", "Database"],
  },
  { label: "AI・データ", labelEn: "AI & Data", tags: ["AI", "MLOps", "Data"] },
  { label: "セキュリティ", labelEn: "Security", tags: ["Security", "Compliance"] },
  {
    label: "言語・開発",
    labelEn: "Languages & Dev",
    tags: ["Frontend", "Backend", "Architecture", "Mobile", "Ruby", "PHP", "Python", "Go", "Java", "Perl", "Blockchain", "OSS"],
  },
  { label: "組織・キャリア", labelEn: "Teams & Career", tags: ["Agile", "Management", "Career", "Design", "Corporate IT", "Community"] },
];

const index = new Map(TAG_GROUPS.flatMap((g) => g.tags.map((t) => [t.toLowerCase(), g.label] as const)));

const OTHER = { label: "その他", labelEn: "Other" };

export function groupTags(tags: string[]): { label: string; labelEn: string; tags: string[] }[] {
  const buckets = new Map<string, string[]>();
  for (const t of tags) {
    const label = index.get(t.toLowerCase()) ?? "その他";
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push(t);
  }
  return [...TAG_GROUPS, OTHER]
    .filter((g) => buckets.has(g.label))
    .map((g) => ({ label: g.label, labelEn: g.labelEn, tags: buckets.get(g.label)!.sort() }));
}
