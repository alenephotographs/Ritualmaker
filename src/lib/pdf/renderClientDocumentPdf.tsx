import path from "node:path";

import { renderToBuffer } from "@react-pdf/renderer";

import type { ClientDocumentRecord } from "@/lib/types/clientDocument";
import type { ProposalPdfViewProps } from "@/lib/types/proposalBuilder";
import { recordToViewProps } from "@/lib/proposal/builderConverters";

import { ProposalDocument } from "./ProposalDocument";

export async function renderProposalPdfBuffer(
  view: ProposalPdfViewProps,
  opts?: { omitPaymentLinks?: boolean },
): Promise<Buffer> {
  const markSrc = path.join(process.cwd(), "public/brand/mark-2.png");
  return renderToBuffer(
    <ProposalDocument
      {...view}
      markSrc={markSrc}
      omitPaymentLinks={opts?.omitPaymentLinks}
    />,
  );
}

export async function renderClientDocumentPdfBuffer(
  document: ClientDocumentRecord,
): Promise<Buffer> {
  return renderProposalPdfBuffer(recordToViewProps(document), {
    omitPaymentLinks: document.paymentLinksStale,
  });
}
