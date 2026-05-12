import Link from "next/link";
import type { SiteSettings } from "@/lib/types/content";
import type { InstagramMediaItem } from "@/lib/instagram";
import { InstagramPostGrid } from "./InstagramPostGrid";

type InstagramFeedSectionProps = {
  settings: SiteSettings | null;
  posts: InstagramMediaItem[] | null;
};

export function InstagramFeedSection({ settings, posts }: InstagramFeedSectionProps) {
  const handle = settings?.instagramHandle?.trim();
  const profileUrl = settings?.instagramUrl?.trim() ?? "https://www.instagram.com/";
  const isDev = process.env.NODE_ENV === "development";
  const hasGrid = Boolean(posts?.length);

  return (
    <section
      id="instagram"
      className="border-t border-ink/10 bg-stone/20 py-20 lg:py-28"
      aria-labelledby="instagram-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/40">Photography</p>
            <h2
              id="instagram-heading"
              className="mt-2 font-display text-3xl font-light sm:text-4xl"
            >
              Instagram
            </h2>
            <p className="mt-2 max-w-lg text-sm text-ink/60">
              Photographs made as a way of marking time, using the same seasonal approach.
            </p>
          </div>
          <Link
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-ink px-5 py-2.5 text-center text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal"
          >
            {handle ? `Open ${handle}` : "Open Instagram"}
          </Link>
        </div>

        {hasGrid && posts ? (
          <div className="mt-10">
            <InstagramPostGrid posts={posts} />
          </div>
        ) : (
          <div
            className={`mt-10 px-6 py-10 text-center text-sm ${
              isDev
                ? "rounded border border-dashed border-ink/20 bg-cream/50 text-ink/50"
                : "text-ink/60"
            }`}
          >
            {isDev ? (
              <>
                <p>
                  Set <code className="text-xs text-ink/70">INSTAGRAM_ACCESS_TOKEN</code> and, for
                  Facebook Graph, <code className="text-xs text-ink/70">INSTAGRAM_USER_ID</code> in{" "}
                  <code className="text-xs text-ink/70">.env.local</code> to show the live grid.
                </p>
                <p className="mt-2">
                  <Link
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink/75 underline decoration-ink/25 underline-offset-4"
                  >
                    Open Instagram{handle ? ` — ${handle}` : ""}
                  </Link>
                </p>
              </>
            ) : (
              <p>
                <Link
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink/75 underline decoration-ink/25 underline-offset-4"
                >
                  {handle ? `Open ${handle}` : "Open Instagram"}
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
