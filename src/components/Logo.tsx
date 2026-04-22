/** Display font treatment for category names (Farm stand, Photographs, On site) — matches the Ritualmaker wordmark. */
export const brandCategoryClassName =
  "font-display text-[0.95rem] tracking-tight text-ink/85 transition-colors hover:text-ink sm:text-base";

type LogoProps = {
  /** Tailwind class controlling the rendered height. The SVG is fluid width. */
  className?: string;
  /** Accessible label for the logo link/image. */
  title?: string;
};

/**
 * @deprecated Prefer `Wordmark` with text "Ritualmaker" for the site header. Kept for assets that still need the image mark.
 */
export function Logo({ className = "h-7 w-auto", title = "Ritualmaker" }: LogoProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/logo.svg" alt={title} className={className} />;
}

type SubMarkProps = {
  className?: string;
  /** "filled" = magenta circle + white vase. "outline" = vase only on transparent. */
  variant?: "filled" | "outline";
  title?: string;
};

/**
 * The round Ritualmaker vase mark (sub mark from the Brand Kit).
 * Use as favicon, app icon, or compact lockup next to the wordmark.
 */
export function SubMark({
  className = "h-8 w-8",
  variant = "filled",
  title = "Ritualmaker",
}: SubMarkProps) {
  const src = variant === "filled" ? "/brand/mark-1.png" : "/brand/mark-2.png";
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={title} className={className} />;
}

/**
 * Pure-CSS wordmark in Oleo Script (the brand display font).
 * Use when an SVG isn't available or you need to inherit text color.
 */
export function Wordmark({
  className = "text-3xl text-ink",
  text = "Ritualmaker",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <span className={`font-display leading-none tracking-tight ${className}`}>
      {text}
    </span>
  );
}
