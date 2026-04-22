"use client";

import { useState } from "react";
import type { ResolvedContactLinks } from "@/lib/siteContact";

type OnLocationService = "florals" | "live-collage";

const servicesList: { id: OnLocationService; label: string }[] = [
  { id: "florals", label: "Event florals" },
  { id: "live-collage", label: "Live Collage™" },
];

function defaultServices(seed?: string): OnLocationService[] {
  if (seed === "live" || seed === "live-collage") return ["live-collage"];
  return ["florals"];
}

export function OnLocationInquiryForm({
  defaultService,
  sectionId = "inquiry",
  contact,
}: {
  defaultService?: string;
  sectionId?: string;
  contact?: ResolvedContactLinks;
}) {
  const [services, setServices] = useState<OnLocationService[]>(
    defaultServices(defaultService),
  );
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  function toggleService(s: OnLocationService) {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  async function onSubmit(formData: FormData) {
    setError(null);
    if (!services.length) {
      setStatus("error");
      setError("Please select at least one service.");
      return;
    }
    setStatus("submitting");
    try {
      const payload = {
        formType: "on-location" as const,
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        eventDate: String(formData.get("eventDate") || "").trim(),
        venue: String(formData.get("venue") || "").trim(),
        guestCount: Number(formData.get("guestCount") || 0) || undefined,
        budgetBand: String(formData.get("budgetBand") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
        services,
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
      <p className="text-xs uppercase tracking-widest text-ink/40">On location</p>
      <h2 className="mt-3 font-display text-4xl font-light">Inquire — florals &amp; Live Collage™</h2>
      <p className="mt-3 text-sm text-ink/65">
        Weddings, pop-up bars, hospitality, and on-site Live Collage™. We will follow up with
        availability and next steps.
      </p>
      <p className="mt-1 text-xs text-ink/45">Typical reply time: within 2 business days.</p>

      {contact ? (
        <div className="mt-4 border border-ink/10 bg-cream/60 px-4 py-3 text-sm text-ink/60">
          <p className="text-xs uppercase tracking-widest text-ink/40">Stand, maps &amp; general</p>
          <p className="mt-2 leading-relaxed text-ink/70">
            For the 24/7 stand, directions, and quick questions:{" "}
            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-ink/25 underline-offset-2 hover:decoration-ink/50"
            >
              Google Maps
            </a>
            {contact.googleProfileUrl ? (
              <>
                {" "}
                ·{" "}
                <a
                  href={contact.googleProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline decoration-ink/25 underline-offset-2 hover:decoration-ink/50"
                >
                  Google Business
                </a>
              </>
            ) : null}
            {contact.email ? (
              <>
                {" "}
                ·{" "}
                <a
                  href={`mailto:${contact.email}`}
                  className="text-ink underline decoration-ink/25 underline-offset-2 hover:decoration-ink/50"
                >
                  {contact.email}
                </a>
              </>
            ) : null}
            . For{" "}
            <a href="/photography#inquiry-photography" className="text-ink underline">
              Ritualmaker Photography
            </a>{" "}
            (field rental or sessions), use the photography form on that page.
          </p>
        </div>
      ) : null}

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
              Services
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {servicesList.map((svc) => {
                const selected = services.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    aria-pressed={selected}
                    className={`px-3 py-2 text-xs uppercase tracking-widest ${
                      selected
                        ? "bg-ink text-cream"
                        : "border border-ink/20 text-ink/70 hover:border-ink/40"
                    }`}
                  >
                    {svc.label}
                  </button>
                );
              })}
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
              Event date
              <input
                type="date"
                name="eventDate"
                className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-ink/70 md:col-span-2">
              Venue / city
              <input
                type="text"
                name="venue"
                className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                placeholder="Where should we show up?"
              />
            </label>
            <label className="text-sm text-ink/70">
              Guest count
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
              <option value="">Select a range</option>
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
              placeholder="Tell us about the event, timeline, and style."
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
            {status === "submitting" ? "Sending..." : "Submit inquiry"}
          </button>
        </form>
      )}
    </div>
  );
}
