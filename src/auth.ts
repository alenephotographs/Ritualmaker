import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sanityClient } from "@/sanity/client";
import type { Vendor } from "@/sanity/types";

function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase();
}

function getAllowedOwnerEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/admin/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Access Code",
      credentials: {
        email: { label: "Email", type: "email" },
        accessCode: { label: "Access code", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(
          typeof credentials?.email === "string" ? credentials.email : undefined,
        );
        const accessCode =
          typeof credentials?.accessCode === "string"
            ? credentials.accessCode.trim()
            : "";
        if (!email || !accessCode) return null;

        const ownerCode = process.env.ADMIN_OWNER_ACCESS_CODE?.trim();
        const isOwner = getAllowedOwnerEmails().includes(email);
        if (isOwner && ownerCode && accessCode === ownerCode) {
          return {
            id: email,
            email,
            role: "owner",
            vendorId: undefined,
          };
        }

        const vendor = await sanityClient.fetch<Vendor | null>(
          `*[_type == "vendor" && coalesce(active, true) == true && lower(contactEmail) == $email && accessCode == $accessCode][0]{
            _id,
            contactEmail
          }`,
          { email, accessCode },
        );
        if (!vendor?._id) return null;

        return {
          id: vendor._id,
          email,
          role: "vendor",
          vendorId: vendor._id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "vendor";
        token.vendorId = (user as { vendorId?: string }).vendorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? "vendor";
        session.user.vendorId = token.vendorId as string | undefined;
      }
      return session;
    },
  },
});
