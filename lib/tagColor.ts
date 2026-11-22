// Palette taken from the neumorphism colour reference (Specifications/UI/color.jpg).
const PALETTE = [
  { bg: "#dbeafe", fg: "#1d4ed8", ring: "#7cb8f7" }, // sky
  { bg: "#e0e7ff", fg: "#3b4fd8", ring: "#5b7cf0" }, // blue
  { bg: "#fce7f6", fg: "#b81f86", ring: "#ec7fd0" }, // pink
  { bg: "#cffafe", fg: "#0e7490", ring: "#4ddbe6" }, // cyan
  { bg: "#d1fae5", fg: "#047857", ring: "#6ddcaa" }, // green
  { bg: "#ede9fe", fg: "#6d28d9", ring: "#8b5cf6" }, // violet
];

export function tagColor(tag: string) {
  let h = 0;
  for (const ch of tag.toLowerCase()) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return PALETTE[h % PALETTE.length];
}
