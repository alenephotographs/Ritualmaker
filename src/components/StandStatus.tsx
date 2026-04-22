import type { SiteSettings } from "@/sanity/types";

export function StandStatus({ settings }: { settings: SiteSettings | null }) {
  if (!settings) return null;
  const { standStatus, standMessage } = settings;

  const palette =
    standStatus === "open"
      ? "bg-moss/15 text-moss border-moss/30"
      : standStatus === "restocking"
        ? "bg-bloom/20 text-magenta border-magenta/30"
        : "bg-ink/10 text-ink/60 border-ink/20";

  const label =
    standStatus === "open"
      ? "Stand open"
      : standStatus === "restocking"
        ? "Restocking soon"
        : "Closed for the season";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-widest ${palette}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
      {standMessage && (
        <span className="ml-2 normal-case tracking-normal opacity-80">
          · {standMessage}
        </span>
      )}
    </div>
  );
}
