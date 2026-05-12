import type { FloralScopeLine } from "@/lib/types/clientDocument";

export type PublicScopeSection = {
  id: string;
  title: string;
  lines: string[];
};

const SECTION_RULES: { id: string; title: string; test: (s: string) => boolean }[] =
  [
    {
      id: "bouquets",
      title: "Bouquets & personal flowers",
      test: (s) =>
        /bouquet|boutonni|boutonniere|corsage|bridesmaid|bridal|ribbon/i.test(s),
    },
    {
      id: "ceremony",
      title: "Ceremony",
      test: (s) => /ceremony|altar|arbor|chuppah|aisle/i.test(s),
    },
    {
      id: "reception",
      title: "Reception",
      test: (s) =>
        /reception|table|centerpiece|sweetheart|head table|guest table/i.test(s),
    },
    {
      id: "installations",
      title: "Installations",
      test: (s) =>
        /install|installation|hanging|entrance|statement|arch|garland/i.test(s),
    },
    {
      id: "rentals",
      title: "Rentals & vessels",
      test: (s) => /rental|vase|urn|candle|pedestal|linen/i.test(s),
    },
    {
      id: "setup",
      title: "Delivery & setup",
      test: (s) =>
        /deliver|delivery|pickup|strike|tear|on-?site|setup|install team|logistics/i.test(
          s,
        ),
    },
  ];

function pushLine(sections: Map<string, PublicScopeSection>, id: string, title: string, line: string) {
  const key = id;
  if (!sections.has(key)) {
    sections.set(key, { id: key, title, lines: [] });
  }
  sections.get(key)!.lines.push(line);
}

function classifyLine(line: string): string {
  const s = line.trim();
  if (!s) return "other";
  for (const r of SECTION_RULES) {
    if (r.test(s)) return r.id;
  }
  return "other";
}

/** Group scope lines into luxury-portal sections (heuristic from text + structured lines). */
export function buildPublicScopeSections(
  floralScopeText: string | undefined,
  floralScope: FloralScopeLine[],
): PublicScopeSection[] {
  const map = new Map<string, PublicScopeSection>();
  const linesFromText = (floralScopeText ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of linesFromText) {
    const id = classifyLine(line);
    if (id === "other") {
      pushLine(map, "other", "Floral details", line);
    } else {
      const title = SECTION_RULES.find((r) => r.id === id)?.title ?? "Details";
      pushLine(map, id, title, line);
    }
  }

  for (const row of floralScope) {
    const primary = row.primary?.trim();
    if (!primary) continue;
    const detail = row.detail?.trim();
    const combined = detail ? `${primary} — ${detail}` : primary;
    const id = classifyLine(primary + " " + (detail ?? ""));
    if (id === "other") {
      pushLine(map, "other", "Floral details", combined);
    } else {
      const title = SECTION_RULES.find((r) => r.id === id)?.title ?? "Details";
      pushLine(map, id, title, combined);
    }
  }

  const order = [
    ...SECTION_RULES.map((r) => r.id),
    "other",
  ];
  const out: PublicScopeSection[] = [];
  for (const key of order) {
    const sec = map.get(key);
    if (sec && sec.lines.length > 0) out.push(sec);
  }
  return out;
}
