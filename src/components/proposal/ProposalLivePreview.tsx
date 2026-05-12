"use client";

import { PDFViewer } from "@react-pdf/renderer";

import { ProposalDocument } from "@/lib/pdf/ProposalDocument";
import type { ProposalPdfViewProps } from "@/lib/types/proposalBuilder";

type Props = {
  view: ProposalPdfViewProps;
  markSrc: string;
};

export function ProposalLivePreview({ view, markSrc }: Props) {
  return (
    <PDFViewer
      width="100%"
      height="100%"
      showToolbar={false}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
      }}
    >
      <ProposalDocument {...view} markSrc={markSrc} />
    </PDFViewer>
  );
}
