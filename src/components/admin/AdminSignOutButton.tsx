"use client";

import { signOut } from "next-auth/react";
import { btnSecondary } from "@/components/admin/AdminPrimitives";

export function AdminSignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/sign-in" })}
      className={`${btnSecondary()} sm:self-end`}
    >
      Sign out
    </button>
  );
}
