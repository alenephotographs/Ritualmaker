/** Display font treatment for category names (Farm stand, Photography, On site) — matches the Ritualmaker wordmark. */
export const brandCategoryClassName =
  "font-display text-[0.95rem] tracking-tight text-ink/85 transition-colors hover:text-ink sm:text-base";

type LogoProps = {
  /** Tailwind class controlling the rendered height. The SVG is fluid width. */
  className?: string;
  /** Accessible label for the logo link/image. */
  title?: string;
};

/**
 * @deprecated Prefer `Wordmark` for the site header.
 */
export function Logo({ className = "h-7 w-auto", title = "Ritualmaker" }: LogoProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/wordmark.png" alt={title} className={className} />;
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
 * Brand wordmark image (transparent PNG). Pass `h-* w-auto` (or max-h-*) via className to size.
 */
export function Wordmark({
  className = "h-8 w-auto",
  text = "Ritualmaker",
}: {
  className?: string;
  text?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/wordmark.png"
      alt={text}
      className={`block object-contain object-left ${className}`}
    />
  );
}
