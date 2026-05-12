"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { recordToViewProps } from "@/lib/proposal/builderConverters";
import type { ClientDocumentRecord } from "@/lib/types/clientDocument";

const ProposalLivePreview = dynamic(
  () =>
    import("@/components/proposal/ProposalLivePreview").then(
      (m) => m.ProposalLivePreview,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-lg bg-ink/[0.04] text-xs text-ink/45">
        Loading preview…
      </div>
    ),
  },
);

export function EventProposalLivePreviewPanel({
  doc,
}: {
  doc: ClientDocumentRecord;
}) {
  const view = useMemo(() => recordToViewProps(doc), [doc]);
  const [markSrc, setMarkSrc] = useState("");

  useEffect(() => {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
    if (base) setMarkSrc(`${base}/brand/mark-2.png`);
  }, []);

  if (!markSrc) {
    return (
      <div className="h-[520px] rounded-lg bg-ink/[0.04]" aria-hidden />
    );
  }

  return (
    <div className="h-[min(720px,80vh)] min-h-[480px] w-full overflow-hidden rounded-xl border border-ink/10 bg-ink/[0.02]">
      <ProposalLivePreview view={view} markSrc={markSrc} />
    </div>
  );
}
