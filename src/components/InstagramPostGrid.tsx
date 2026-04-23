import type { InstagramMediaItem } from "@/lib/instagram";

export function InstagramPostGrid({ posts }: { posts: InstagramMediaItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-1.5 lg:gap-2">
      {posts.map((post) => {
        const alt = post.caption
          ? post.caption.slice(0, 120)
          : "Photo from the Ritualmaker Instagram";
        return (
          <li key={post.id} className="group relative aspect-square overflow-hidden bg-stone/40">
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Instagram CDN; patterns vary by region */}
              <img
                src={post.imageUrl}
                alt={alt}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:opacity-95"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <span className="sr-only">View on Instagram (opens in a new tab)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
