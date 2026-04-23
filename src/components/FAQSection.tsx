import type { FAQ } from "@/sanity/types";
import { PortableText } from "next-sanity";

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  if (!faqs.length) return null;

  return (
    <section
      id="faq"
      className="bg-stone/30 py-20 lg:py-28"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-ink/40">
          FAQ
        </p>
        <h2
          id="faq-heading"
          className="mt-3 font-display text-4xl font-light lg:text-5xl"
        >
          Quick answers
        </h2>

        <div className="mt-12 divide-y divide-ink/10 border-t border-ink/10">
          {faqs.map((f) => (
            <details key={f._id} className="group py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <h3 className="font-display text-xl font-light">{f.question}</h3>
                <span className="mt-1 text-2xl font-light text-ink/40 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/70">
                <PortableText value={f.answer} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
