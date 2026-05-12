import { notFound } from "next/navigation";

import { HostedProposalClient } from "@/components/hosted/HostedProposalClient";
import { getClientDocumentByPublicToken } from "@/lib/db";
import { toPublicProposalView } from "@/lib/proposalPublicView";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { token: string };
  searchParams: { paid?: string };
};

export default async function HostedProposalPage({
  params,
  searchParams,
}: PageProps) {
  const token = params.token?.trim();
  if (!token) notFound();

  const doc = await getClientDocumentByPublicToken(token);
  if (!doc) notFound();

  const initial = toPublicProposalView(doc);
  if (!initial) notFound();

  return (
    <HostedProposalClient
      token={token}
      initial={initial}
      paymentReturn={searchParams.paid}
    />
  );
}
