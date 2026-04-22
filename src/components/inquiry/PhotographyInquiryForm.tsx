"use client";

import { useState } from "react";

export type PhotoInquiryKind =
  | "field-rental"
  | "sessions-with-me"
  | "wedding-engagement-on-location";

const kindOptions: { value: PhotoInquiryKind; label: string }[] = [
  { value: "field-rental", label: "Field rental (portrait use of the farm)" },
  { value: "sessions-with-me", label: "Sessions with me (farm or elsewhere)" },
  {
    value: "wedding-engagement-on-location",
    label: "Wedding, engagement, or on-location coverage",
  },
];

function kindFromSearchParam(raw?: string): PhotoInquiryKind | undefined {
  if (raw === "field" || raw === "field-rental") return "field-rental";
  if (raw === "sessions" || raw === "sessions-with-me") return "sessions-with-me";
  if (
    raw === "wedding" ||
    raw === "wedding-engagement-on-location" ||
    raw === "event"
  ) {
    return "wedding-engagement-on-location";
  }
  return undefined;
}

export function PhotographyInquiryForm({
  sectionId = "inquiry-photography",
  defaultKind,
}: {
  sectionId?: string;
  /** From ?kind= on the URL */
  defaultKind?: string;
}) {
  const [kind, setKind] = useState<PhotoInquiryKind>(
    () => kindFromSearchParam(defaultKind) ?? "sessions-with-me",
  );
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    setStatus("submitting");
    try {
      const payload = {
        formType: "photography" as const,
        photoInquiryKind: kind,
        services: ["photography"] as const,
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        eventDate: String(formData.get("eventDate") || "").trim(),
        venue: String(formData.get("venue") || "").trim(),
        guestCount: Number(formData.get("guestCount") || 0) || undefined,
        budgetBand: String(formData.get("budgetBand") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
      };
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit inquiry");
      setStatus("success");
    } catch (submitError) {
      setStatus("error");
      setError(
        submitError instanceof Error ? submitError.message : "Could not submit inquiry",
      );
    }
  }

  return (
    <div id={sectionId} className="border border-ink/10 bg-white p-8">
      <p className="text-xs uppercase tracking-widest text-ink/40">Photography</p>
      <h2 className="mt-3 font-display text-4xl font-light">Photography inquiry</h2>
      <p className="mt-3 text-sm text-ink/65">
        Field rental, sessions, and wedding or on-location coverage — we will confirm dates and
        scope with you.
      </p>

      {status === "success" ? (
        <p className="mt-6 border border-moss/30 bg-moss/10 px-4 py-3 text-sm text-moss">
          Inquiry received. We will review and follow up within 2 business days.
        </p>
      ) : (
        <form
          className="mt-6 space-y-4"
          action={async (formData) => {
            await onSubmit(formData);
          }}
        >
          <fieldset>
            <legend className="text-xs uppercase tracking-widest text-ink/50">
              What are you inquiring about?
            </legend>
            <div className="mt-2 space-y-2">
              {kindOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-start gap-3 border border-ink/10 bg-cream/30 px-3 py-2.5 text-sm text-ink/80 has-[:checked]:border-ink/40 has-[:checked]:bg-white"
                >
                  <input
                    type="radio"
                    name="photoInquiryKindUi"
                    value={opt.value}
                    checked={kind === opt.value}
                    onChange={() => setKind(opt.value)}
                    className="mt-0.5"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-ink/70">
              Name
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-ink/70">
              Email
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-ink/70">
              Phone
              <input
                type="text"
                name="phone"
                autoComplete="tel"
                className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-ink/70">
              Preferred date or season
              <input
                type="date"
                name="eventDate"
                className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-ink/70 md:col-span-2">
              Location or venue
              <input
                type="text"
                name="venue"
                className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                placeholder='e.g. "farm", town, or venue name'
              />
            </label>
            <label className="text-sm text-ink/70">
              Guest count (if applicable)
              <input
                type="number"
                name="guestCount"
                min={1}
                className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="block text-sm text-ink/70">
            Budget band
            <select name="budgetBand" className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm">
              <option value="">Prefer not to say</option>
              <option value="under-3k">Under $3k</option>
              <option value="3k-6k">$3k-$6k</option>
              <option value="6k-10k">$6k-$10k</option>
              <option value="10k-plus">$10k+</option>
            </select>
          </label>

          <label className="block text-sm text-ink/70">
            Notes
            <textarea
              name="notes"
              rows={5}
              className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
              placeholder="Tell us about your timeline, vision, and anything we should know."
            />
          </label>

          {status === "error" && (
            <p
              role="alert"
              aria-live="polite"
              className="border border-magenta/30 bg-bloom/15 px-4 py-3 text-sm text-magenta"
            >
              {error ?? "Could not submit inquiry"}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            {status === "submitting" ? "Sending..." : "Submit photography inquiry"}
          </button>
        </form>
      )}
    </div>
  );
}
