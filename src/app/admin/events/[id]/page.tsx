import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { EventOrderAdmin } from "@/components/EventOrderAdmin";
import { getClientDocumentById } from "@/lib/db";

export const metadata = {
  title: "Event & proposal",
};

export const dynamic = "force-dynamic";

type PageProps = { params: { id: string } };

export default async function AdminEventDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "owner") {
    redirect("/admin");
  }

  const doc = await getClientDocumentById(params.id).catch(() => null);
  if (!doc) notFound();

  return (
    <EventOrderAdmin
      documentId={doc.id}
      initialDocument={doc}
      userEmail={session.user.email}
    />
  );
}
