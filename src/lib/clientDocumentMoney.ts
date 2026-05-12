import type { FloralScopeLine } from "@/lib/types/clientDocument";

export function formatUsdFromCents(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function parseUsdToCents(raw: string): number | null {
  const s = raw.replace(/[$,\s]/g, "").trim();
  if (!s) return null;
  const n = Number.parseFloat(s);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function balanceCents(
  total: number | null | undefined,
  deposit: number | null | undefined,
): number | null {
  if (total == null || deposit == null) return null;
  return Math.max(0, total - deposit);
}

/** For admin textarea ↔ JSON storage + PDF. */
export function floralJsonToText(lines: FloralScopeLine[]): string {
  if (!lines.length) return "";
  return lines
    .map((l) =>
      l.detail && l.detail.trim() ? `${l.primary}\n${l.detail}` : l.primary,
    )
    .join("\n\n");
}

export function floralTextToJson(text: string): FloralScopeLine[] {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const out: FloralScopeLine[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.length === 1) out.push({ primary: lines[0] });
    else out.push({ primary: lines[0], detail: lines.slice(1).join("\n") });
  }
  return out;
}
