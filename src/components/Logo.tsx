/** Display font treatment for category names (Farm stand, Photography, On location) — matches the Ritualmaker wordmark. */
export const brandCategoryClassName =
  "font-display text-[0.95rem] tracking-tight text-ink/85 transition-colors hover:text-ink sm:text-base";

type LogoProps = {
  /** Tailwind classes controlling the rendered logo size. */
  className?: string;
  /** Accessible label for the logo. */
  title?: string;
};

/**
 * @deprecated Prefer `Wordmark` for the site header.
 */
export function Logo({ className = "h-7 w-auto", title = "Ritualmaker" }: LogoProps) {
  return <Wordmark title={title} className={className} />;
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
 * Transparent logo mask. The asset supplies shape only; the header background shows through.
 */
export function Wordmark({
  className = "h-8 w-auto",
  title = "Ritualmaker",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <span
      role="img"
      aria-label={title}
      className={`block max-w-full shrink-0 bg-ink [aspect-ratio:1589/120] [-webkit-mask-image:url('/brand/logo.svg')] [mask-image:url('/brand/logo.svg')] [-webkit-mask-position:left_center] [mask-position:left_center] [-webkit-mask-repeat:no-repeat] [mask-repeat:no-repeat] [-webkit-mask-size:contain] [mask-size:contain] ${className}`}
    />
  );
}
