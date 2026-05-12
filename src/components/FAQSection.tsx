import type { FAQ } from "@/sanity/types";

function faqAnswerPlainText(answer: FAQ["answer"]): string {
  return answer
    .map((block) =>
      (block.children ?? [])
        .map((c) => c.text ?? "")
        .join(""),
    )
    .join("\n\n");
}

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  if (!faqs.length) return null;

  return (
    <section
      id="faq"
      className="scroll-mt-[calc(5.5rem+env(safe-area-inset-top))] bg-stone/30 py-20 lg:py-28"
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
        <p className="mt-3 text-sm leading-relaxed text-ink/60">
          Flowers, pantry, summer vegetables, events, and custom work — quick answers below.
        </p>

        <div className="mt-12 divide-y divide-ink/10 border-t border-ink/10">
          {faqs.map((f) => {
            const parts = faqAnswerPlainText(f.answer)
              .split(/\n\n+/)
              .map((p) => p.trim())
              .filter(Boolean);
            return (
            <details key={f._id} className="group py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <h3 className="font-display text-xl font-light">{f.question}</h3>
                <span className="mt-1 text-2xl font-light text-ink/40 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-ink/70">
                {parts.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
