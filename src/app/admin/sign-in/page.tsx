import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSignInForm } from "@/components/AdminSignInForm";

export const metadata = {
  title: "Admin sign-in",
};

export default async function AdminSignInPage() {
  const session = await auth();
  if (session?.user?.email) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-6 py-16 lg:px-10">
      <AdminSignInForm />
    </div>
  );
}
