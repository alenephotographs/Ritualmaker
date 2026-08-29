"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { EventProposalLivePreviewPanel } from "@/components/admin/EventProposalLivePreviewPanel";
import { formatUsdFromCents } from "@/lib/clientDocumentMoney";
import {
  computeInvoiceTotalMismatch,
  computePaymentLinksStale,
} from "@/lib/clientDocumentPaymentState";
import { deriveProposalLifecycle } from "@/lib/proposalLifecycleLogic";
import type { ClientDocumentRecord } from "@/lib/types/clientDocument";
import type { ProposalLifecycleStatus } from "@/lib/types/proposalLifecycle";
import {
  PROPOSAL_LIFECYCLE_ORDER,
  parseProposalLifecycleStatus,
} from "@/lib/types/proposalLifecycle";

type SaveState = "idle" | "saving" | "saved" | "error";

type Props = {
  documentId: string;
  initialDocument: ClientDocumentRecord;
  userEmail?: string | null;
};

const IMMEDIATE_PATCH_KEYS = new Set([
  "proposalTotalCents",
  "depositAmountCents",
  "status",
  "paymentDepositPaid",
  "paymentBalancePaid",
  "paymentDueDate",
  "documentType",
]);

function centsFromDollarsInput(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function dollarsFromCents(c: number | null | undefined): string {
  if (c == null || !Number.isFinite(c)) return "";
  return (c / 100).toFixed(2);
}

function withStaleFromTotals(
  base: ClientDocumentRecord,
  next: Partial<ClientDocumentRecord>,
): ClientDocumentRecord {
  const merged = { ...base, ...next };
  const paymentLinksStale = computePaymentLinksStale({
    stripePaymentLinkDepositId: merged.stripePaymentLinkDepositId,
    lastPaymentSnapshotTotal: merged.lastPaymentSnapshotTotal ?? null,
    lastPaymentSnapshotDeposit: merged.lastPaymentSnapshotDeposit ?? null,
    lastPaymentSnapshotBalance: merged.lastPaymentSnapshotBalance ?? null,
    lastPaymentSnapshotBalanceDueDate:
      merged.lastPaymentSnapshotBalanceDueDate ?? null,
    proposalTotalCents: merged.proposalTotalCents,
    depositAmountCents: merged.depositAmountCents,
    paymentDueDate: merged.paymentDueDate,
  });
  const t = merged.proposalTotalCents;
  const d = merged.depositAmountCents;
  const balanceAmountCents =
    t != null && d != null ? Math.max(0, t - d) : merged.balanceAmountCents;
  return { ...merged, paymentLinksStale, balanceAmountCents };
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
      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
      : tone === "warn"
        ? "bg-amber-50 text-amber-950 border-amber-200"
        : tone === "bad"
          ? "bg-rose-50 text-rose-900 border-rose-200"
          : "bg-ink/[0.04] text-ink/70 border-ink/10";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}
    >
      {children}
    </span>
  );
}

const fieldClass =
  "w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none ring-0 placeholder:text-ink/25 focus:border-ink/25";

const labelClass = "mb-1 block text-[10px] font-medium uppercase tracking-widest text-ink/40";

export function EventOrderAdmin({
  documentId,
  initialDocument,
  userEmail,
}: Props) {
  const [doc, setDoc] = useState<ClientDocumentRecord>(initialDocument);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [stripeBusy, setStripeBusy] = useState(false);
  const [proposalPortalBusy, setProposalPortalBusy] = useState(false);
  const [lifecyclePick, setLifecyclePick] = useState<ProposalLifecycleStatus>(
    parseProposalLifecycleStatus(initialDocument.proposalLifecycleStatus),
  );
  const pendingPatch = useRef<Record<string, unknown>>({});
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processing = useRef(false);

  useEffect(() => {
    setDoc(initialDocument);
  }, [initialDocument]);

  useEffect(() => {
    setLifecyclePick(parseProposalLifecycleStatus(doc.proposalLifecycleStatus));
  }, [doc.proposalLifecycleStatus]);

  const invoiceMismatch = useMemo(() => computeInvoiceTotalMismatch(doc), [doc]);

  const depositPct = useMemo(() => {
    const t = doc.proposalTotalCents ?? 0;
    const d = doc.depositAmountCents ?? 0;
    if (t <= 0) return 0;
    return Math.round((d / t) * 1000) / 10;
  }, [doc.proposalTotalCents, doc.depositAmountCents]);

  const processSaveQueue = useCallback(async () => {
    if (processing.current) return;
    if (Object.keys(pendingPatch.current).length === 0) return;
    processing.current = true;
    setSaveState("saving");
    try {
      // Drain pending patches that arrived during previous saves in one loop.
      while (Object.keys(pendingPatch.current).length > 0) {
        const body = { ...pendingPatch.current };
        pendingPatch.current = {};
        const res = await fetch(`/api/admin/client-documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as {
          error?: string;
          document?: ClientDocumentRecord;
        };
        if (!res.ok || !data.document) {
          setSaveState("error");
          console.error(data.error ?? res.statusText);
          return;
        }
        setDoc(data.document);
      }
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1800);
    } catch (e) {
      console.error(e);
      setSaveState("error");
    } finally {
      processing.current = false;
      if (Object.keys(pendingPatch.current).length > 0) {
        void processSaveQueue();
      }
    }
  }, [documentId]);

  const queuePatch = useCallback(
    (patch: Record<string, unknown>) => {
      pendingPatch.current = { ...pendingPatch.current, ...patch };
      const immediate = Object.keys(patch).some((k) =>
        IMMEDIATE_PATCH_KEYS.has(k),
      );
      if (immediate) {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
          debounceTimer.current = null;
        }
        void processSaveQueue();
        return;
      }
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null;
        void processSaveQueue();
      }, 600);
    },
    [processSaveQueue],
  );

  const patchText = useCallback(
    (key: string, value: string) => {
      queuePatch({ [key]: value });
    },
    [queuePatch],
  );

  const onNumericTotal = useCallback(
    (dollars: number) => {
      const cents = centsFromDollarsInput(dollars);
      setDoc((d) =>
        withStaleFromTotals(d, {
          proposalTotalCents: cents || null,
        }),
      );
      queuePatch({ proposalTotalCents: cents || null });
    },
    [queuePatch],
  );

  const onNumericDeposit = useCallback(
    (dollars: number) => {
      const cents = centsFromDollarsInput(dollars);
      setDoc((d) =>
        withStaleFromTotals(d, {
          depositAmountCents: cents || null,
        }),
      );
      queuePatch({ depositAmountCents: cents || null });
    },
    [queuePatch],
  );

  const hostedProposalUrl = useMemo(() => {
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const tok = doc.proposalPublicToken?.trim();
    if (!origin || !tok) return "";
    return `${origin}/proposal/${tok}`;
  }, [doc.proposalPublicToken]);

  const hostedLinkExpired = useMemo(() => {
    if (!doc.proposalPublicTokenExpiresAt) return false;
    return new Date(doc.proposalPublicTokenExpiresAt).getTime() <= Date.now();
  }, [doc.proposalPublicTokenExpiresAt]);

  async function runStripe(
    fn: () => Promise<Response>,
    onJson: (d: ClientDocumentRecord) => void,
  ) {
    if (stripeBusy) return;
    setStripeBusy(true);
    try {
      const res = await fn();
      const data = (await res.json()) as {
        error?: string;
        document?: ClientDocumentRecord;
        code?: string;
      };
      if (!res.ok) {
        alert(data.error ?? "Stripe action failed");
        return;
      }
      if (data.document) onJson(data.document);
    } finally {
      setStripeBusy(false);
    }
  }

  async function runProposalPortal(
    fn: () => Promise<Response>,
    onJson: (d: ClientDocumentRecord) => void,
  ) {
    if (proposalPortalBusy) return;
    setProposalPortalBusy(true);
    try {
      const res = await fn();
      const data = (await res.json()) as {
        error?: string;
        document?: ClientDocumentRecord;
      };
      if (!res.ok) {
        alert(data.error ?? "Proposal portal action failed");
        return;
      }
      if (data.document) onJson(data.document);
    } finally {
      setProposalPortalBusy(false);
    }
  }

  async function copyText(url: string) {
    if (!url.trim()) {
      alert("No link yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(url.trim());
    } catch {
      alert("Could not copy.");
    }
  }

  const balanceCents =
    doc.balanceAmountCents ??
    (doc.proposalTotalCents != null && doc.depositAmountCents != null
      ? Math.max(0, doc.proposalTotalCents - doc.depositAmountCents)
      : 0);

  const hasStripeLinks = Boolean(doc.stripePaymentLinkDepositId?.trim());
  const linksEmphasized = hasStripeLinks && !doc.paymentLinksStale;
  const derivedLifecycle = useMemo(() => deriveProposalLifecycle(doc), [doc]);

  return (
    <div className="min-h-screen bg-[#faf9f7] text-ink">
      <header className="sticky top-0 z-10 border-b border-ink/8 bg-[#faf9f7]/95 px-5 py-4 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/events"
              className="text-[10px] uppercase tracking-widest text-ink/40 hover:text-ink/65"
            >
              ← Events &amp; proposals
            </Link>
            <h1 className="text-sm font-medium text-ink">Event &amp; proposal</h1>
            {doc.paymentLinksStale ? (
              <Badge tone="warn">Payment links need update</Badge>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-ink/45">
              {saveState === "saving"
                ? "Saving…"
                : saveState === "saved"
                  ? "Saved"
                  : saveState === "error"
                    ? "Error saving"
                    : ""}
            </span>
            <span className="hidden text-xs text-ink/35 sm:inline">
              {userEmail}
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/sign-in" })}
              className="text-[10px] uppercase tracking-widest text-ink/40 hover:text-ink/65"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-5 py-10 lg:px-10">
        {(doc.paymentLinksStale && hasStripeLinks) || invoiceMismatch ? (
          <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
            {doc.paymentLinksStale && hasStripeLinks ? (
              <p>
                Totals changed after payment links were created. Regenerate links
                before sending to the client.
              </p>
            ) : null}
            {invoiceMismatch ? (
              <p>
                Invoice may not match current event total. Void and recreate before
                sending.
              </p>
            ) : null}
          </div>
        ) : null}

        <section className="rounded-xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
            Payment status
          </h2>
          <div className="flex flex-wrap gap-2">
            {doc.status === "lead" ? (
              <Badge>Proposal draft</Badge>
            ) : (
              <Badge tone="ok">Status: {doc.status.replace("_", " ")}</Badge>
            )}
            {doc.proposalPdfGeneratedAt ? (
              <Badge tone="ok">Proposal PDF generated</Badge>
            ) : (
              <Badge>Proposal PDF not generated</Badge>
            )}
            {hasStripeLinks ? (
              <Badge tone={doc.paymentLinksStale ? "warn" : "ok"}>
                Deposit link created
              </Badge>
            ) : (
              <Badge>Deposit link not created</Badge>
            )}
            {doc.stripePaymentLinkBalanceId ? (
              <Badge tone={doc.paymentLinksStale ? "warn" : "ok"}>
                Balance link created
              </Badge>
            ) : balanceCents < 50 && (doc.proposalTotalCents ?? 0) > 0 ? (
              <Badge tone="neutral">Balance link n/a</Badge>
            ) : (
              <Badge>Balance link not created</Badge>
            )}
            {doc.stripeInvoiceId ? (
              <Badge tone="ok">Invoice created</Badge>
            ) : (
              <Badge>Invoice not created</Badge>
            )}
            {doc.paymentLinksStale ? (
              <Badge tone="warn">Payment links stale</Badge>
            ) : null}
            {doc.paymentDepositPaid ? (
              <Badge tone="ok">Deposit paid</Badge>
            ) : null}
            {doc.paymentBalancePaid ? (
              <Badge tone="ok">Balance paid</Badge>
            ) : null}
            {doc.stripeInvoiceStatus === "paid" ? (
              <Badge tone="ok">Invoice paid</Badge>
            ) : null}
            {doc.paymentDepositPaid &&
            (doc.paymentBalancePaid || balanceCents < 50) ? (
              <Badge tone="ok">Paid in full</Badge>
            ) : null}
            {doc.proposalPublicToken && !doc.proposalLinkDisabled && !hostedLinkExpired ? (
              <Badge tone="ok">Hosted proposal live</Badge>
            ) : doc.proposalPublicToken && doc.proposalLinkDisabled ? (
              <Badge tone="bad">Hosted link revoked</Badge>
            ) : doc.proposalPublicToken && hostedLinkExpired ? (
              <Badge tone="bad">Hosted link expired</Badge>
            ) : (
              <Badge>Hosted proposal not set up</Badge>
            )}
            {doc.stripeInvoiceUrl || doc.stripeInvoicePdfUrl ? (
              <Badge tone="ok">Invoice available to client</Badge>
            ) : doc.documentType === "invoice" ? (
              <Badge tone="warn">Client can generate invoice</Badge>
            ) : (
              <Badge>Client invoice off</Badge>
            )}
            <Badge tone="neutral">
              Workflow: {derivedLifecycle.replace(/_/g, " ")}
            </Badge>
          </div>
        </section>

        <section className="rounded-xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
            Live proposal preview
          </h2>
          <p className="mb-4 text-sm text-ink/50">
            Same layout as the PDF export. The client portal uses these totals and
            scope.
          </p>
          <EventProposalLivePreviewPanel doc={doc} />
        </section>

        <section className="rounded-xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
            Client portal
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-ink/55">
            Generate a temporary private link for this client. They review, approve,
            download documents, and pay on Ritualmaker with Stripe Checkout - amounts
            always match the numbers above. Optional legacy Stripe Payment Links stay
            in Payment tools.
          </p>
          {!process.env.NEXT_PUBLIC_SITE_URL ? (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
              Set <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_SITE_URL</code>{" "}
              so hosted links use a stable public origin.
            </p>
          ) : null}
          <div className="mb-4">
            <label className={labelClass}>Client proposal URL</label>
            <input
              readOnly
              className={`${fieldClass} bg-ink/[0.03]`}
              value={hostedProposalUrl}
              placeholder={
                doc.proposalPublicToken
                  ? "Add NEXT_PUBLIC_SITE_URL to show full URL"
                  : "Generate a link to see the URL"
              }
            />
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={proposalPortalBusy}
              onClick={() =>
                void runProposalPortal(
                  () =>
                    fetch(
                      `/api/admin/client-documents/${documentId}/proposal-host`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "rotate_token",
                        }),
                      },
                    ),
                  (d) => setDoc(d),
                )
              }
              className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
            >
              {doc.proposalPublicToken
                ? "Regenerate temporary client link"
                : "Generate temporary client link"}
            </button>
            <button
              type="button"
              disabled={proposalPortalBusy || !hostedProposalUrl || hostedLinkExpired}
              onClick={() => void copyText(hostedProposalUrl)}
              className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/80 disabled:opacity-40"
            >
              Copy client proposal link
            </button>
            <button
              type="button"
              disabled={proposalPortalBusy || !hostedProposalUrl || hostedLinkExpired}
              onClick={() =>
                window.open(hostedProposalUrl, "_blank", "noopener,noreferrer")
              }
              className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/80 disabled:opacity-40"
            >
              Open client proposal link
            </button>
            {doc.proposalLinkDisabled ? (
              <button
                type="button"
                disabled={proposalPortalBusy}
                onClick={() =>
                  void runProposalPortal(
                    () =>
                      fetch(
                        `/api/admin/client-documents/${documentId}/proposal-host`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "enable_link" }),
                        },
                      ),
                    (d) => setDoc(d),
                  )
                }
                className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-950 disabled:opacity-40"
              >
                Enable hosted link
              </button>
            ) : (
              <button
                type="button"
                disabled={proposalPortalBusy || !doc.proposalPublicToken}
                onClick={() =>
                  void runProposalPortal(
                    () =>
                      fetch(
                        `/api/admin/client-documents/${documentId}/proposal-host`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "disable_link" }),
                        },
                      ),
                    (d) => setDoc(d),
                  )
                }
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-900 disabled:opacity-40"
              >
                Revoke client link
              </button>
            )}
          </div>
          <div className="grid gap-3 border-t border-ink/8 pt-6 text-xs text-ink/60 sm:grid-cols-2">
            <p>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink/35">
                Link expires
              </span>
              <br />
              <span className="text-sm text-ink">
                {doc.proposalPublicTokenExpiresAt
                  ? new Date(doc.proposalPublicTokenExpiresAt).toLocaleString()
                  : "Generate a link to start the 30-day window"}
              </span>
            </p>
            <p>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink/35">
                First opened
              </span>
              <br />
              <span className="text-sm text-ink">
                {doc.proposalFirstViewedAt
                  ? new Date(doc.proposalFirstViewedAt).toLocaleString()
                  : "—"}
              </span>
            </p>
            <p>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink/35">
                Last opened
              </span>
              <br />
              <span className="text-sm text-ink">
                {doc.proposalLastViewedAt
                  ? new Date(doc.proposalLastViewedAt).toLocaleString()
                  : "—"}
              </span>
            </p>
            <p>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink/35">
                Page views
              </span>
              <br />
              <span className="text-sm text-ink">{doc.proposalViewCount ?? 0}</span>
            </p>
            <p>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink/35">
                Approved
              </span>
              <br />
              <span className="text-sm text-ink">
                {doc.proposalApprovedAt
                  ? `${new Date(doc.proposalApprovedAt).toLocaleString()} · ${doc.proposalApprovedName ?? ""}`
                  : "—"}
              </span>
            </p>
            <p>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink/35">
                Payment status
              </span>
              <br />
              <span className="text-sm text-ink">
                {doc.paymentDepositPaid &&
                (doc.paymentBalancePaid || balanceCents < 50)
                  ? "Paid in full"
                  : doc.paymentDepositPaid
                    ? "Deposit paid, balance due"
                    : "No website payment received"}
              </span>
            </p>
            <p>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink/35">
                Invoice
              </span>
              <br />
              <span className="text-sm text-ink">
                {doc.stripeInvoiceUrl || doc.stripeInvoicePdfUrl
                  ? `Available (${doc.stripeInvoiceStatus ?? "open"})`
                  : doc.documentType === "invoice"
                    ? "Client generation enabled"
                    : "Not enabled for client"}
              </span>
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-ink/8 pt-6">
            <button
              type="button"
              disabled={proposalPortalBusy}
              onClick={() => {
                const name = window.prompt(
                  "Signer name (appears on the record)",
                  doc.clientName?.trim() || "",
                );
                if (name == null) return;
                void runProposalPortal(
                  () =>
                    fetch(
                      `/api/admin/client-documents/${documentId}/proposal-host`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "mark_approved",
                          approvedName: name,
                        }),
                      },
                    ),
                  (d) => setDoc(d),
                );
              }}
              className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/80 disabled:opacity-40"
            >
              Mark approved (offline)
            </button>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className={labelClass}>Override lifecycle</label>
                <select
                  className={fieldClass}
                  value={lifecyclePick}
                  onChange={(e) =>
                    setLifecyclePick(e.target.value as ProposalLifecycleStatus)
                  }
                >
                  {PROPOSAL_LIFECYCLE_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={
                  proposalPortalBusy || lifecyclePick === doc.proposalLifecycleStatus
                }
                onClick={() =>
                  void runProposalPortal(
                    () =>
                      fetch(
                        `/api/admin/client-documents/${documentId}/proposal-host`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "set_lifecycle",
                            lifecycle: lifecyclePick,
                          }),
                        },
                      ),
                    (d) => setDoc(d),
                  )
                }
                className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/80 disabled:opacity-40"
              >
                Save status
              </button>
            </div>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-ink/40">
            Regenerating the link invalidates the old URL and starts a fresh 30-day
            window. Checkout sessions from this page always use current totals;
            outdated amounts cannot clear as paid.
          </p>
        </section>

        <section className="rounded-xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
            Event summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Client name</label>
              <input
                className={fieldClass}
                value={doc.clientName ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, clientName: v }));
                  patchText("clientName", v);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Event type</label>
              <input
                className={fieldClass}
                value={doc.eventType ?? ""}
                placeholder="Wedding, corporate, etc."
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, eventType: v }));
                  patchText("eventType", v);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Event date</label>
              <input
                className={fieldClass}
                type="text"
                value={doc.eventDate ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, eventDate: v }));
                  patchText("eventDate", v);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                className={fieldClass}
                value={doc.location ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, location: v }));
                  patchText("location", v);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={fieldClass}
                value={doc.status}
                onChange={(e) => {
                  const v = e.target.value as ClientDocumentRecord["status"];
                  setDoc((d) => ({ ...d, status: v }));
                  queuePatch({ status: v });
                }}
              >
                <option value="lead">Lead</option>
                <option value="proposal_sent">Proposal sent</option>
                <option value="booked">Booked</option>
                <option value="complete">Complete</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Client invoice access</label>
              <select
                className={fieldClass}
                value={doc.documentType}
                onChange={(e) => {
                  const v = e.target.value as ClientDocumentRecord["documentType"];
                  setDoc((d) => ({ ...d, documentType: v }));
                  queuePatch({ documentType: v });
                }}
              >
                <option value="proposal">Proposal only</option>
                <option value="invoice">Corporate invoice enabled</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Package title</label>
              <input
                className={fieldClass}
                value={doc.packageTitle}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, packageTitle: v }));
                  patchText("packageTitle", v);
                }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
            Client details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={fieldClass}
                value={doc.clientEmail ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, clientEmail: v }));
                  patchText("clientEmail", v);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Phone (optional)</label>
              <input
                className={fieldClass}
                value={doc.clientPhone ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, clientPhone: v }));
                  patchText("clientPhone", v);
                }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
            Proposal details
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Subtitle</label>
              <textarea
                rows={2}
                className={fieldClass}
                value={doc.packageSubtitle ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, packageSubtitle: v }));
                  patchText("packageSubtitle", v);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Floral scope (one line per item)</label>
              <textarea
                rows={10}
                className={fieldClass}
                value={doc.floralScopeText ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, floralScopeText: v }));
                  patchText("floralScopeText", v);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Visible notes</label>
              <textarea
                rows={4}
                className={fieldClass}
                value={doc.notes ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, notes: v }));
                  patchText("notes", v);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Day-of</label>
              <textarea
                rows={3}
                className={fieldClass}
                value={doc.dayOf ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, dayOf: v }));
                  patchText("dayOf", v);
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Bridesmaid ribbon names</label>
              <input
                className={fieldClass}
                value={doc.bridesmaidRibbonNames ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, bridesmaidRibbonNames: v }));
                  patchText("bridesmaidRibbonNames", v);
                }}
              />
            </div>
            <div className="border-t border-ink/8 pt-4">
              <label className={labelClass}>Internal notes (not on PDF)</label>
              <textarea
                rows={3}
                className={`${fieldClass} bg-ink/[0.02]`}
                value={doc.internalNotes ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => ({ ...d, internalNotes: v }));
                  patchText("internalNotes", v);
                }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
            Payment schedule
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Proposal total (USD)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className={fieldClass}
                value={dollarsFromCents(doc.proposalTotalCents)}
                onChange={(e) =>
                  onNumericTotal(Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className={labelClass}>Deposit (USD)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className={fieldClass}
                value={dollarsFromCents(doc.depositAmountCents)}
                onChange={(e) =>
                  onNumericDeposit(Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className={labelClass}>Balance due date</label>
              <input
                type="date"
                className={fieldClass}
                value={doc.paymentDueDate ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setDoc((d) => withStaleFromTotals(d, { paymentDueDate: v }));
                  queuePatch({ paymentDueDate: v });
                }}
              />
            </div>
          </div>
          <div className="mt-6 rounded-lg border border-ink/8 bg-cream/40 p-4 text-sm">
            <p className="mb-2 font-medium text-ink">Recalculation preview</p>
            <p className="text-ink/70">
              Deposit {depositPct}% · Deposit{" "}
              <span className="font-semibold text-ink tabular-nums">
                {formatUsdFromCents(doc.depositAmountCents ?? 0)}
              </span>{" "}
              · Balance{" "}
              <span className="font-semibold text-ink tabular-nums">
                {formatUsdFromCents(balanceCents)}
              </span>{" "}
              · Total{" "}
              <span className="font-semibold text-ink tabular-nums">
                {formatUsdFromCents(doc.proposalTotalCents ?? 0)}
              </span>
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
            Payment tools
          </h2>
          <p className="mb-4 text-sm text-ink/50">
            Secondary: legacy Stripe Payment Links and PDF. Primary client payments
            happen on the client portal (Stripe Checkout from current totals).
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={stripeBusy}
              onClick={() => {
                window.open(
                  `/api/admin/client-documents/${documentId}/pdf`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
              className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
            >
              Export proposal PDF
            </button>
            <button
              type="button"
              disabled={stripeBusy}
              onClick={() => {
                window.open(
                  `/api/admin/client-documents/${documentId}/pdf`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
              className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/80 disabled:opacity-40"
            >
              Download proposal PDF
            </button>
            <button
              type="button"
              disabled={stripeBusy}
              onClick={() =>
                void runStripe(
                  () =>
                    fetch(
                      `/api/admin/client-documents/${documentId}/stripe-payment-links`,
                      { method: "POST" },
                    ),
                  (d) => setDoc(d),
                )
              }
              className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/80 disabled:opacity-40"
            >
              Create deposit & balance links
            </button>
            <button
              type="button"
              disabled={stripeBusy || !hasStripeLinks}
              onClick={() =>
                void runStripe(
                  () =>
                    fetch(
                      `/api/admin/client-documents/${documentId}/stripe-payment-links`,
                      { method: "POST" },
                    ),
                  (d) => setDoc(d),
                )
              }
              className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-950 disabled:opacity-40"
            >
              Regenerate payment links
            </button>
            <button
              type="button"
              disabled={stripeBusy}
              onClick={() =>
                void runStripe(
                  () =>
                    fetch(
                      `/api/admin/client-documents/${documentId}/stripe-invoice`,
                      { method: "POST" },
                    ),
                  (d) => setDoc(d),
                )
              }
              className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/80 disabled:opacity-40"
            >
              Create Stripe invoice
            </button>
            <button
              type="button"
              disabled={stripeBusy}
              onClick={() =>
                void runStripe(
                  () =>
                    fetch(
                      `/api/admin/client-documents/${documentId}/stripe-invoice/void-and-recreate`,
                      { method: "POST" },
                    ),
                  (d) => setDoc(d),
                )
              }
              className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/80 disabled:opacity-40"
            >
              Void old invoice + create updated invoice
            </button>
            <button
              type="button"
              disabled={stripeBusy}
              onClick={() =>
                void runStripe(
                  () =>
                    fetch(
                      `/api/admin/client-documents/${documentId}/sync-payments`,
                      { method: "POST" },
                    ),
                  (d) => setDoc(d),
                )
              }
              className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/80 disabled:opacity-40"
            >
              Refresh from Stripe
            </button>
          </div>
          <p className="mt-3 text-xs text-ink/45">
            Stripe actions never run automatically while you edit — only when you press
            a button above.
          </p>
          <div className="mt-6 space-y-3 border-t border-ink/8 pt-6">
            <p className={labelClass}>Links</p>
            <div
              className={
                linksEmphasized ? "opacity-100" : "opacity-45 line-through decoration-ink/20"
              }
            >
              <label className={labelClass}>Deposit URL</label>
              <input
                readOnly
                className={`${fieldClass} bg-ink/[0.03]`}
                value={doc.depositLink ?? ""}
              />
            </div>
            <div
              className={
                linksEmphasized ? "opacity-100" : "opacity-45 line-through decoration-ink/20"
              }
            >
              <label className={labelClass}>Balance URL</label>
              <input
                readOnly
                className={`${fieldClass} bg-ink/[0.03]`}
                value={doc.balanceLink ?? ""}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copyText(doc.depositLink ?? "")}
                className="rounded-full border border-ink/12 px-3 py-1.5 text-[11px] uppercase tracking-wide text-ink/75"
              >
                Copy deposit link
              </button>
              <button
                type="button"
                onClick={() => void copyText(doc.balanceLink ?? "")}
                className="rounded-full border border-ink/12 px-3 py-1.5 text-[11px] uppercase tracking-wide text-ink/75"
              >
                Copy balance link
              </button>
              <button
                type="button"
                onClick={() => void copyText(doc.stripeInvoiceUrl ?? "")}
                className="rounded-full border border-ink/12 px-3 py-1.5 text-[11px] uppercase tracking-wide text-ink/75"
              >
                Copy invoice link
              </button>
              <button
                type="button"
                onClick={() => {
                  const u = doc.stripeInvoiceUrl?.trim();
                  if (u) window.open(u, "_blank", "noopener,noreferrer");
                  else alert("No invoice yet.");
                }}
                className="rounded-full border border-ink/12 px-3 py-1.5 text-[11px] uppercase tracking-wide text-ink/75"
              >
                Open invoice
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
