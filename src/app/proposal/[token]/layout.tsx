import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Your proposal — Ritualmaker",
  robots: { index: false, follow: false },
};

export default function ProposalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-ink antialiased">{children}</div>
  );
}
