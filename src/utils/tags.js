const PALETTE = [
  "#c2f24e",
  "#7fd1ff",
  "#ff9f7f",
  "#c58cff",
  "#ffd166",
  "#6ee7b7",
];

export function tagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export const PRIORITY_ORDER = ["low", "medium", "high"];