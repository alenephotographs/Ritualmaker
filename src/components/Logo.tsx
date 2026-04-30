/** Display font treatment for category names (Farm stand, Photography, On location) — matches the Ritualmaker wordmark. */
export const brandCategoryClassName =
  "font-display text-[0.95rem] tracking-tight text-ink/85 transition-colors hover:text-ink sm:text-base";

type LogoProps = {
  /** Tailwind classes controlling the rendered text treatment. */
  className?: string;
  /** Accessible label/text for the logo. */
  title?: string;
};

/**
 * @deprecated Prefer `Wordmark` for the site header.
 */
export function Logo({ className = "h-7 w-auto", title = "Ritualmaker" }: LogoProps) {
  return <Wordmark text={title} className={className} />;
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
 * Text wordmark. This avoids raster/SVG asset backgrounds in constrained browser headers.
 */
export function Wordmark({
  className = "text-5xl",
  text = "Ritualmaker",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <span
      aria-label={text}
      className={`block shrink-0 font-display font-light leading-none tracking-tight text-ink ${className}`}
    >
      {text}
    </span>
  );
}
