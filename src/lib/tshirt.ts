export type GroupSlug = "u6-u7" | "u8" | "u9" | "loisir";

export const GROUPS: { slug: GroupSlug; label: string }[] = [
  { slug: "u6-u7", label: "U6 – U7" },
  { slug: "u8", label: "U8" },
  { slug: "u9", label: "U9" },
  { slug: "loisir", label: "Foot Loisir" },
];

export const CHILD_SIZES = [
  "Enfant - 4 ANS",
  "Enfant - 6 ANS",
  "Enfant - 8 ANS",
  "Enfant - 10 ANS",
  "Enfant - 12 ANS",
  "Enfant - 14 ANS",
];

export const ADULT_SIZES = [
  "Adulte - S",
  "Adulte - M",
  "Adulte - L",
  "Adulte - XL",
  "Adulte - XXL",
  "Adulte - 3XL",
  "Adulte - 4XL",
];

export const ALL_SIZES = [...CHILD_SIZES, ...ADULT_SIZES];

export function isGroupSlug(value: string): value is GroupSlug {
  return GROUPS.some((g) => g.slug === value);
}

export function groupLabel(slug: string): string {
  return GROUPS.find((g) => g.slug === slug)?.label ?? slug;
}

export type Order = {
  id: string;
  group_slug: string;
  first_name: string;
  last_name: string;
  initials: string;
  size: string;
  created_at: string;
};
