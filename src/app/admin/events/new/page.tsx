import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { parseClientDocumentBody } from "@/lib/clientDocumentPayload";
import { insertClientDocument } from "@/lib/db";

export default async function NewAdminEventPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "owner") {
    redirect("/admin");
  }

  const payload = parseClientDocumentBody({
    packageTitle: "New event",
    documentType: "proposal",
    totalLine: "",
    floralScope: [],
  });
  if (!payload) {
    redirect("/admin/events");
  }

  const doc = await insertClientDocument(payload).catch(() => null);
  if (doc) {
    redirect(`/admin/events/${doc.id}`);
  }
  redirect("/admin/events");
}
