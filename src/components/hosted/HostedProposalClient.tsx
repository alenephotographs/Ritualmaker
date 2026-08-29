"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { formatUsdFromCents } from "@/lib/clientDocumentMoney";
import type { PublicProposalViewModel } from "@/lib/proposalPublicView";
import type { ProposalLifecycleStatus } from "@/lib/types/proposalLifecycle";

const MIN_CHARGE_CENTS = 50;

function formatWhen(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function lifecycleLabel(s: ProposalLifecycleStatus): string {
  switch (s) {
    case "draft":
      return "Draft";
    case "sent":
      return "Sent";
    case "viewed":
      return "Viewed";
    case "approved":
      return "Approved";
    case "balance_due":
      return "Payment due";
    case "deposit_paid":
      return "Deposit received";
    case "partially_paid":
      return "Partial payment";
    case "paid_in_full":
      return "Paid in full";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Unavailable";
    default:
      return s;
  }
}

function lifecycleTone(
  s: ProposalLifecycleStatus,
): "neutral" | "ok" | "warn" | "bad" {
  if (s === "paid_in_full" || s === "completed") return "ok";
  if (s === "deposit_paid" || s === "approved") return "ok";
  if (s === "partially_paid") return "warn";
  if (s === "balance_due") return "warn";
  if (s === "cancelled") return "bad";
  if (s === "viewed" || s === "sent") return "neutral";
  return "neutral";
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn" | "bad";
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-900 border-emerald-200/80"
      : tone === "warn"
        ? "bg-amber-50 text-amber-950 border-amber-200/80"
        : tone === "bad"
          ? "bg-rose-50 text-rose-900 border-rose-200/80"
          : "bg-white/80 text-ink/70 border-ink/10";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${cls}`}
    >
      {children}
    </span>
  );
}

type Props = {
  token: string;
  initial: PublicProposalViewModel;
  paymentReturn?: string;
};

export function HostedProposalClient({ token, initial, paymentReturn }: Props) {
  const router = useRouter();
  const viewPosted = useRef(false);
  const [fullName, setFullName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [approveBusy, setApproveBusy] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState<
    null | "deposit" | "balance" | "full"
  >(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoiceAvailable, setInvoiceAvailable] = useState(
    initial.invoiceAvailable,
  );

  useEffect(() => {
    if (viewPosted.current) return;
    viewPosted.current = true;
    void (async () => {
      try {
        await fetch(`/api/proposal/${encodeURIComponent(token)}/view`, {
          method: "POST",
        });
        router.refresh();
      } catch {
        /* non-blocking */
      }
    })();
  }, [token, router]);

  useEffect(() => {
    if (!paymentReturn) return;
    void (async () => {
      await router.refresh();
      router.replace(`/proposal/${encodeURIComponent(token)}`, {
        scroll: false,
      });
    })();
  }, [paymentReturn, router, token]);

  const v = initial;
  const t = v.proposalTotalCents ?? 0;
  const d = v.depositAmountCents ?? 0;
  const bal = v.balanceAmountCents ?? Math.max(0, t - d);
  const paidFull =
    v.paymentDepositPaid && (v.paymentBalancePaid || bal < MIN_CHARGE_CENTS);

  const canPayDeposit =
    Boolean(v.proposalApprovedAt) &&
    !v.paymentDepositPaid &&
    d >= MIN_CHARGE_CENTS;
  const canPayBalance =
    Boolean(v.proposalApprovedAt) &&
    v.paymentDepositPaid &&
    !v.paymentBalancePaid &&
    bal >= MIN_CHARGE_CENTS;
  const canPayFull =
    Boolean(v.proposalApprovedAt) &&
    !paidFull &&
    (v.paymentDepositPaid ? bal >= MIN_CHARGE_CENTS : t >= MIN_CHARGE_CENTS);

  const timeline = useMemo(() => {
    const steps: {
      key: string;
      label: string;
      detail?: string;
      done: boolean;
    }[] = [
      {
        key: "sent",
        label: "Proposal sent",
        detail: "You received your private link.",
        done: true,
      },
      {
        key: "viewed",
        label: "Proposal opened",
        detail: v.proposalFirstViewedAt
          ? formatWhen(v.proposalFirstViewedAt)
          : undefined,
        done: (v.proposalViewCount ?? 0) > 0,
      },
      {
        key: "approved",
        label: "Approved",
        detail: v.proposalApprovedAt
          ? `${formatWhen(v.proposalApprovedAt)}${v.proposalApprovedName ? ` · ${v.proposalApprovedName}` : ""}`
          : undefined,
        done: Boolean(v.proposalApprovedAt),
      },
      {
        key: "deposit",
        label: "Deposit paid",
        detail: v.depositPaidAt ? formatWhen(v.depositPaidAt) : undefined,
        done: v.paymentDepositPaid,
      },
      {
        key: "full",
        label: "Paid in full",
        detail: v.balancePaidAt ? formatWhen(v.balancePaidAt) : undefined,
        done: paidFull,
      },
    ];
    return steps;
  }, [v, paidFull]);

  async function startCheckout(mode: "deposit" | "balance" | "full") {
    setCheckoutError(null);
    setCheckoutBusy(mode);
    try {
      const res = await fetch(
        `/api/proposal/${encodeURIComponent(token)}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode }),
        },
      );
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? "Could not start checkout.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Could not start checkout.");
    } finally {
      setCheckoutBusy(null);
    }
  }

  async function onApprove(e: React.FormEvent) {
    e.preventDefault();
    setApproveError(null);
    setApproveBusy(true);
    try {
      const res = await fetch(
        `/api/proposal/${encodeURIComponent(token)}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, agreed }),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setApproveError(data.error ?? "Could not record approval.");
        return;
      }
      router.refresh();
    } catch {
      setApproveError("Could not record approval.");
    } finally {
      setApproveBusy(false);
    }
  }

  async function generateInvoice() {
    setInvoiceError(null);
    setInvoiceBusy(true);
    try {
      const res = await fetch(
        `/api/proposal/${encodeURIComponent(token)}/invoice`,
        { method: "POST" },
      );
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        setInvoiceError(data.error ?? "Could not generate invoice.");
        return;
      }
      setInvoiceAvailable(true);
      window.open(data.url, "_blank", "noopener,noreferrer");
      router.refresh();
    } catch {
      setInvoiceError("Could not generate invoice.");
    } finally {
      setInvoiceBusy(false);
    }
  }

  const heroMeta = [v.eventType, v.eventDate, v.location].filter(Boolean).join(" · ");
  const tone = lifecycleTone(v.lifecycle);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <header className="mb-14 text-center sm:mb-20">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.35em] text-ink/40">
          Ritualmaker Flowers
        </p>
        <h1 className="mb-4 font-[family-name:var(--font-display)] text-3xl leading-tight text-ink sm:text-4xl">
          {v.packageTitle?.trim() || "Your floral proposal"}
        </h1>
        {v.packageSubtitle ? (
          <p className="mx-auto max-w-lg whitespace-pre-line text-base leading-relaxed text-ink/55">
            {v.packageSubtitle}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col items-center gap-3">
          {v.clientName ? (
            <p className="text-sm text-ink/60">
              Prepared for{" "}
              <span className="font-medium text-ink">{v.clientName}</span>
            </p>
          ) : null}
          {heroMeta ? (
            <p className="max-w-md text-center text-sm leading-relaxed text-ink/50">
              {heroMeta}
            </p>
          ) : null}
          <Badge tone={tone}>{lifecycleLabel(v.lifecycle)}</Badge>
        </div>
      </header>

      <section className="mb-14 rounded-2xl border border-ink/[0.06] bg-white/70 p-8 shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-sm sm:p-10">
        <h2 className="mb-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/38">
          Event overview
        </h2>
        <div className="space-y-6 text-[15px] leading-relaxed text-ink/70">
          {v.notes ? (
            <div>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-ink/35">
                Summary
              </p>
              <p className="whitespace-pre-line">{v.notes}</p>
            </div>
          ) : null}
          {v.intakeNotes ? (
            <div>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-ink/35">
                Direction
              </p>
              <p className="whitespace-pre-line">{v.intakeNotes}</p>
            </div>
          ) : null}
          {v.dayOf ? (
            <div>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-ink/35">
                Day-of
              </p>
              <p className="whitespace-pre-line">{v.dayOf}</p>
            </div>
          ) : null}
          {v.bridesmaidRibbonNames ? (
            <div>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-ink/35">
                Ribbon names
              </p>
              <p>{v.bridesmaidRibbonNames}</p>
            </div>
          ) : null}
          {!v.notes && !v.intakeNotes && !v.dayOf && !v.bridesmaidRibbonNames ? (
            <p className="text-ink/45">
              Your planner will add narrative notes here as the design firms up.
            </p>
          ) : null}
        </div>
      </section>

      {v.scopeSections.length > 0 ? (
        <section className="mb-14">
          <h2 className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/38">
            Floral scope &amp; services
          </h2>
          <div className="space-y-6">
            {v.scopeSections.map((sec) => (
              <article
                key={sec.id}
                className="rounded-2xl border border-ink/[0.06] bg-white/60 p-7 sm:p-8"
              >
                <h3 className="mb-4 font-[family-name:var(--font-display)] text-xl text-ink">
                  {sec.title}
                </h3>
                <ul className="space-y-3 text-[15px] leading-relaxed text-ink/68">
                  {sec.lines.map((line, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#a7266d]/50"
                        aria-hidden
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-14 rounded-2xl border border-ink/[0.06] bg-[#fdfcfa] p-8 sm:p-10">
        <h2 className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/38">
          Investment
        </h2>
        <div className="mx-auto max-w-sm space-y-6">
          <div className="flex items-end justify-between gap-4 border-b border-ink/[0.06] pb-5">
            <span className="text-sm text-ink/50">Proposal total</span>
            <span className="font-[family-name:var(--font-display)] text-2xl tabular-nums text-ink">
              {formatUsdFromCents(t)}
            </span>
          </div>
          <div className="flex items-end justify-between gap-4 border-b border-ink/[0.06] pb-5">
            <span className="text-sm text-ink/50">Deposit</span>
            <span className="text-xl tabular-nums text-ink">
              {formatUsdFromCents(d)}
            </span>
          </div>
          <div className="flex items-end justify-between gap-4 pb-1">
            <span className="text-sm text-ink/50">Balance</span>
            <span className="text-xl tabular-nums text-ink">
              {formatUsdFromCents(bal)}
            </span>
          </div>
          {v.paymentDueDate ? (
            <p className="text-center text-sm text-ink/45">
              Balance due by{" "}
              <span className="text-ink/70">{formatWhen(v.paymentDueDate)}</span>
            </p>
          ) : null}
        </div>
      </section>

      {!v.proposalApprovedAt ? (
        <section className="mb-14 rounded-2xl border border-ink/[0.08] bg-white p-8 sm:p-10">
          <h2 className="mb-2 text-center font-[family-name:var(--font-display)] text-2xl text-ink">
            Approve this proposal
          </h2>
          <p className="mb-8 text-center text-sm leading-relaxed text-ink/50">
            When you are ready, sign below to unlock secure payment. You can pay
            deposit, balance, or in full — amounts always match this page.
          </p>
          <form onSubmit={onApprove} className="mx-auto max-w-md space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-ink/40"
              >
                Full legal name
              </label>
              <input
                id="fullName"
                className="w-full rounded-xl border border-ink/10 bg-cream/50 px-4 py-3.5 text-[15px] text-ink outline-none ring-0 placeholder:text-ink/25 focus:border-ink/25"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                placeholder="As it should appear on the agreement"
              />
            </div>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-ink/65">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-ink/20 text-[#a7266d] focus:ring-[#a7266d]/30"
              />
              <span>
                I have reviewed this proposal and agree to the scope, pricing,
                and terms as presented.
              </span>
            </label>
            {approveError ? (
              <p className="text-sm text-rose-700">{approveError}</p>
            ) : null}
            <button
              type="submit"
              disabled={approveBusy || !agreed || fullName.trim().length < 2}
              className="w-full rounded-full bg-ink py-4 text-sm font-medium text-cream transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {approveBusy ? "Saving…" : "Approve proposal"}
            </button>
          </form>
        </section>
      ) : (
        <section className="mb-14 rounded-2xl border border-emerald-200/60 bg-emerald-50/35 p-8 text-center sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-800/70">
            Approved
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-emerald-950">
            {v.proposalApprovedName}
          </p>
          <p className="mt-1 text-sm text-emerald-900/60">
            {v.proposalApprovedAt ? formatWhen(v.proposalApprovedAt) : null}
          </p>
        </section>
      )}

      <section className="mb-14 rounded-2xl border border-ink/[0.06] bg-white/80 p-8 sm:p-10">
        <h2 className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/38">
          Pay securely
        </h2>
        {!v.proposalApprovedAt ? (
          <p className="text-center text-sm leading-relaxed text-ink/50">
            Approve the proposal above to enable card checkout. Each session is
            built for the exact totals on this page.
          </p>
        ) : (
          <>
            {checkoutError ? (
              <p className="mb-6 text-center text-sm text-rose-700">
                {checkoutError}
              </p>
            ) : null}
            <div className="mx-auto flex max-w-md flex-col gap-3">
              <button
                type="button"
                disabled={!canPayDeposit || checkoutBusy !== null}
                onClick={() => void startCheckout("deposit")}
                className="rounded-full bg-[#272727] py-4 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {checkoutBusy === "deposit"
                  ? "Redirecting…"
                  : `Pay deposit · ${formatUsdFromCents(d)}`}
              </button>
              <button
                type="button"
                disabled={!canPayBalance || checkoutBusy !== null}
                onClick={() => void startCheckout("balance")}
                className="rounded-full border border-ink/12 bg-white py-4 text-sm font-medium text-ink/85 transition hover:border-ink/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {checkoutBusy === "balance"
                  ? "Redirecting…"
                  : `Pay balance · ${formatUsdFromCents(bal)}`}
              </button>
              <button
                type="button"
                disabled={!canPayFull || checkoutBusy !== null}
                onClick={() => void startCheckout("full")}
                className="rounded-full border border-transparent py-4 text-sm font-medium text-ink/55 underline-offset-4 hover:text-ink/75 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40"
              >
                {checkoutBusy === "full"
                  ? "Redirecting…"
                  : v.paymentDepositPaid
                    ? `Pay remaining in one step · ${formatUsdFromCents(bal)}`
                    : `Pay in full · ${formatUsdFromCents(t)}`}
              </button>
            </div>
            {d < MIN_CHARGE_CENTS && !v.paymentDepositPaid ? (
              <p className="mt-6 text-center text-xs text-ink/45">
                Deposit is set below the card minimum; use pay in full or ask
                your planner to adjust the schedule.
              </p>
            ) : null}
          </>
        )}
      </section>

      <section className="mb-14 rounded-2xl border border-ink/[0.06] bg-white/70 p-8 text-center sm:p-10">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/38">
          Documents
        </h2>
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <a
            href={`/api/proposal/${encodeURIComponent(token)}/pdf`}
            className="rounded-full bg-ink py-4 text-sm font-medium text-cream transition hover:bg-ink/90"
          >
            Download Proposal PDF
          </a>
          {invoiceAvailable ? (
            <a
              href={`/api/proposal/${encodeURIComponent(token)}/invoice`}
              className="rounded-full border border-ink/12 bg-white py-4 text-sm font-medium text-ink/85 transition hover:border-ink/25"
            >
              Download Invoice
            </a>
          ) : v.invoiceEnabled ? (
            <button
              type="button"
              disabled={invoiceBusy || !v.proposalApprovedAt}
              onClick={() => void generateInvoice()}
              className="rounded-full border border-ink/12 bg-white py-4 text-sm font-medium text-ink/85 transition hover:border-ink/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {invoiceBusy ? "Generating invoice..." : "Generate invoice"}
            </button>
          ) : null}
        </div>
        {v.invoiceEnabled && !v.proposalApprovedAt && !invoiceAvailable ? (
          <p className="mt-4 text-xs text-ink/45">
            Approve the proposal first to generate a corporate invoice.
          </p>
        ) : null}
        {invoiceError ? (
          <p className="mt-4 text-sm text-rose-700">{invoiceError}</p>
        ) : null}
      </section>

      <section className="mb-14">
        <h2 className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/38">
          Your progress
        </h2>
        <ol className="relative mx-auto max-w-md border-l border-ink/10 pl-8">
          {timeline.map((step) => (
            <li key={step.key} className="relative pb-10 last:pb-0">
              <span
                className={`absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-cream ${
                  step.done ? "bg-[#607946]" : "bg-ink/15"
                }`}
                aria-hidden
              />
              <p
                className={`text-sm font-medium ${step.done ? "text-ink" : "text-ink/40"}`}
              >
                {step.label}
              </p>
              {step.detail ? (
                <p className="mt-1 text-xs text-ink/45">{step.detail}</p>
              ) : step.key === "sent" ? (
                <p className="mt-1 text-xs text-ink/45">
                  Save this page to revisit status anytime.
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-ink/[0.06] pt-10 text-center">
        <p className="mt-6 text-[11px] text-ink/35">
          Questions? Reply to your Ritualmaker thread or reach us through your
          planner.
        </p>
      </footer>
    </div>
  );
}
