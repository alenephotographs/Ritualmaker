import type { ReactNode } from "react";

/** Shared field styling: labels above inputs, comfortable tap targets on mobile */
export const adminInputClass =
  "mt-1.5 w-full min-w-0 rounded-md border border-ink/20 bg-white px-3 py-2.5 text-sm text-ink shadow-sm transition focus:border-ink/40 focus:outline-none focus:ring-1 focus:ring-ink/15 min-h-[44px] sm:min-h-[42px]";

export const adminLabelClass = "block text-xs font-medium uppercase tracking-widest text-ink/55";

export const adminHelperClass = "mt-1.5 block text-xs text-ink/50";

export function AdminSection({
  id,
  title,
  description,
  children,
  className = "",
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`min-w-0 max-w-full scroll-mt-[calc(5.5rem+env(safe-area-inset-top))] border border-ink/10 bg-cream/30 shadow-sm ${className}`}
    >
      <div className="sticky top-0 z-10 border-b border-ink/10 bg-cream/95 px-5 py-4 backdrop-blur-sm sm:px-6">
        <h2 className="font-display text-2xl font-light text-ink sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-full break-words text-sm leading-relaxed text-ink/65 sm:max-w-3xl">
            {description}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 max-w-full space-y-6 overflow-x-auto px-5 py-8 sm:px-6">{children}</div>
    </section>
  );
}

export function AdminCard({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 max-w-full rounded-lg border border-ink/10 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {title ? (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-ink">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-ink/55">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-ink/20 bg-cream/40 px-6 py-10 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-full break-words text-sm text-ink/55 sm:max-w-md">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  const styles = {
    success: "border-moss/35 bg-moss/10 text-moss",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-magenta/30 bg-bloom/10 text-magenta",
    info: "border-ink/15 bg-ink/5 text-ink/75",
    neutral: "border-ink/15 bg-ink/5 text-ink/55",
  } as const;
  return (
    <span
      className={`inline-flex max-w-full min-w-0 items-center break-words rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-widest ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export function btnPrimary(disabled?: boolean) {
  return `inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-ink px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-cream shadow-sm transition hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-h-0`;
}

export function btnSecondary(disabled?: boolean) {
  return `inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-ink/25 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-ink/80 shadow-sm transition hover:border-ink/40 hover:bg-cream/50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-h-0`;
}

export function btnUtility(disabled?: boolean) {
  return `inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-ink/15 bg-transparent px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-ink/65 transition hover:border-ink/30 hover:bg-cream/40 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-h-0`;
}

export function btnDestructive(disabled?: boolean) {
  return `inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-magenta/35 bg-bloom/10 px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-magenta transition hover:bg-bloom/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-h-0`;
}

export function SectionFeedback({
  kind,
  message,
}: {
  kind: "success" | "error";
  message: string;
}) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-md border px-4 py-3 text-sm break-words ${
        kind === "error"
          ? "border-magenta/30 bg-bloom/10 text-magenta"
          : "border-moss/30 bg-moss/10 text-moss"
      }`}
    >
      {message}
    </div>
  );
}
