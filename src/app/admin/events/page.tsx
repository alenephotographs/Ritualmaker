import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { formatUsdFromCents } from "@/lib/clientDocumentMoney";
import { computeInvoiceTotalMismatch } from "@/lib/clientDocumentPaymentState";
import { listClientDocuments } from "@/lib/db";
import { deriveProposalLifecycle } from "@/lib/proposalLifecycleLogic";

export const metadata = {
  title: "Events & Proposals",
};

export const dynamic = "force-dynamic";

function fmtDateTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function lifecycleHuman(s: string): string {
  return s.replace(/_/g, " ");
}

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "owner") {
    redirect("/admin");
  }

  const documents = await listClientDocuments().catch((e) => {
    console.error("[admin/events] listClientDocuments", e);
    return [];
  });

  return (
    <div className="min-h-screen bg-[#faf9f7] text-ink">
      <header className="border-b border-ink/8 bg-white px-5 py-4 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-[10px] uppercase tracking-widest text-ink/40 hover:text-ink/65"
            >
              ← Admin
            </Link>
            <div>
              <h1 className="text-sm font-medium text-ink">Events &amp; Proposals</h1>
              <p className="text-[11px] text-ink/45">
                Build here → send the client portal link → they approve &amp; pay on your site.
              </p>
            </div>
          </div>
          <Link
            href="/admin/events/new"
            className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-white"
          >
            New event / proposal
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-10">
        {documents.length === 0 ? (
          <div className="space-y-3 text-sm text-ink/55">
            <p>No events yet. Create one to start a proposal and client portal.</p>
            <p>
              <Link href="/admin/events/new" className="font-medium text-ink underline">
                New event / proposal
              </Link>
            </p>
            <p className="text-xs text-ink/45">
              If this stays empty after creating events, confirm{" "}
              <code className="rounded bg-ink/[0.06] px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              and{" "}
              <code className="rounded bg-ink/[0.06] px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
              on this deployment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-ink/8 bg-white shadow-sm">
            <table className="min-w-[960px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-ink/[0.02] text-[10px] font-semibold uppercase tracking-wider text-ink/45">
                  <th className="px-3 py-3">Client</th>
                  <th className="px-3 py-3">Event date</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Workflow</th>
                  <th className="px-3 py-3">Deposit</th>
                  <th className="px-3 py-3">Balance</th>
                  <th className="px-3 py-3">Paid full</th>
                  <th className="px-3 py-3">Portal</th>
                  <th className="px-3 py-3">Last viewed</th>
                  <th className="px-3 py-3">Approved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {documents.map((d) => {
                  const stale = d.paymentLinksStale;
                  const invBad = computeInvoiceTotalMismatch(d);
                  const derived = deriveProposalLifecycle(d);
                  const bal =
                    d.balanceAmountCents ??
                    (d.proposalTotalCents != null && d.depositAmountCents != null
                      ? Math.max(0, d.proposalTotalCents - d.depositAmountCents)
                      : 0);
                  const paidFull =
                    d.paymentDepositPaid &&
                    (d.paymentBalancePaid || bal < 50);
                  const portal =
                    d.proposalPublicToken && !d.proposalLinkDisabled
                      ? "Live"
                      : d.proposalPublicToken && d.proposalLinkDisabled
                        ? "Disabled"
                        : "—";
                  const title =
                    d.clientName?.trim() ||
                    d.packageTitle?.trim() ||
                    d.id.slice(0, 8);
                  return (
                    <tr key={d.id} className="hover:bg-ink/[0.02]">
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/events/${d.id}`}
                          className="font-medium text-ink underline-offset-2 hover:underline"
                        >
                          {title}
                        </Link>
                        {stale || invBad ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {stale ? (
                              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium uppercase text-amber-950 ring-1 ring-amber-200">
                                Links stale
                              </span>
                            ) : null}
                            {invBad ? (
                              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-medium uppercase text-rose-900 ring-1 ring-rose-200">
                                Invoice
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-ink/70">
                        {d.eventDate?.trim() || "—"}
                      </td>
                      <td className="px-3 py-3 text-ink/70">
                        {d.eventType?.trim() || "—"}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-ink/80">
                        {d.proposalTotalCents != null
                          ? formatUsdFromCents(d.proposalTotalCents)
                          : "—"}
                      </td>
                      <td className="px-3 py-3 text-xs capitalize text-ink/70">
                        {lifecycleHuman(derived)}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {d.paymentDepositPaid ? (
                          <span className="text-emerald-800">Paid</span>
                        ) : (
                          <span className="text-ink/45">Open</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {d.paymentBalancePaid ? (
                          <span className="text-emerald-800">Paid</span>
                        ) : bal >= 50 ? (
                          <span className="text-ink/45">Due</span>
                        ) : (
                          <span className="text-ink/35">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {paidFull ? (
                          <span className="text-emerald-800">Yes</span>
                        ) : (
                          <span className="text-ink/45">No</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs">{portal}</td>
                      <td className="px-3 py-3 text-xs text-ink/60">
                        {fmtDateTime(d.proposalLastViewedAt)}
                      </td>
                      <td className="px-3 py-3 text-xs text-ink/60">
                        {d.proposalApprovedAt ? (
                          <>
                            <span className="text-emerald-800">Yes</span>
                            <br />
                            <span className="text-[10px] text-ink/45">
                              {d.proposalApprovedName ?? "—"}
                            </span>
                          </>
                        ) : (
                          <span className="text-ink/45">No</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
