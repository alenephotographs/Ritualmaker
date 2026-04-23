"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function AdminSignInForm() {
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setStatus("submitting");
    setError(null);
    try {
      const result = await signIn("credentials", {
        email,
        accessCode,
        redirect: false,
        callbackUrl: "/admin",
      });
      if (!result || result.error) {
        throw new Error("Invalid email or access code");
      }
      window.location.href = result.url ?? "/admin";
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not sign in");
    }
  }

  return (
    <div className="w-full max-w-md border border-ink/10 bg-white p-7">
      <p className="text-xs uppercase tracking-widest text-ink/40">Admin sign-in</p>
      <h1 className="mt-2 font-display text-4xl font-light">Access code</h1>
      <p className="mt-3 text-sm text-ink/60">
        Email + access code.
      </p>
      <form
        className="mt-6"
        onSubmit={async (event) => {
          event.preventDefault();
          await submit();
        }}
      >
        <label className="block text-sm text-ink/70">
          Email
          <input
            type="email"
            value={email}
            required
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full border border-ink/20 px-3 py-2"
            placeholder="you@example.com"
          />
        </label>
        <label className="mt-4 block text-sm text-ink/70">
          Access code
          <input
            type="password"
            value={accessCode}
            required
            autoComplete="current-password"
            onChange={(event) => setAccessCode(event.target.value)}
            className="mt-1 w-full border border-ink/20 px-3 py-2"
            placeholder="Enter access code"
          />
        </label>
        <button
          type="submit"
          disabled={!email || !accessCode || status === "submitting"}
          className="mt-4 bg-ink px-5 py-2.5 text-xs uppercase tracking-widest text-cream hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-ink/30"
        >
          {status === "submitting" ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {status === "error" && (
        <p
          role="alert"
          className="mt-4 border border-magenta/30 bg-bloom/10 px-3 py-2 text-sm text-magenta"
        >
          {error}
        </p>
      )}
    </div>
  );
}
