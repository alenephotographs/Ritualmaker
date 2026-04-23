import "server-only";

const REVALIDATE_SEC = 300;

export type InstagramMediaItem = {
  id: string;
  imageUrl: string;
  permalink: string;
  /** Short caption for alt text (optional). */
  caption: string | null;
};

type GraphChild = {
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
};

type GraphMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  children?: { data?: GraphChild[] };
};

type GraphListResponse = { data?: GraphMedia[]; error?: { message: string } };

const FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "children{media_url,media_type,thumbnail_url}",
].join(",");

function pickImageUrl(post: GraphMedia): string | null {
  if (post.media_type === "VIDEO" && post.thumbnail_url) {
    return post.thumbnail_url;
  }
  if (post.media_type === "CAROUSEL_ALBUM" && post.children?.data?.[0]) {
    const c = post.children.data[0];
    if (c.media_type === "VIDEO" && c.thumbnail_url) return c.thumbnail_url;
    if (c.media_url) return c.media_url;
  }
  return post.media_url ?? null;
}

/**
 * Fetches recent Instagram media using Meta’s APIs (server only).
 *
 * Set both:
 * - `INSTAGRAM_ACCESS_TOKEN` — long‑lived token with `instagram_basic` and access to the account
 * - `INSTAGRAM_USER_ID` — Instagram business/creator id from Meta Business Suite (use with
 *   `https://graph.facebook.com/.../USER_ID/media`)
 *
 * If `INSTAGRAM_USER_ID` is omitted, falls back to `https://graph.instagram.com/me/media` (works
 * for some user tokens). See `.env.example` and Meta’s Instagram API docs.
 */
export async function getRecentInstagramMedia(
  limit = 8,
): Promise<InstagramMediaItem[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) {
    return null;
  }

  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const q = new URLSearchParams({
    fields: FIELDS,
    access_token: token,
    limit: String(Math.min(25, Math.max(1, limit))),
  });
  const url = userId
    ? `https://graph.facebook.com/v21.0/${encodeURIComponent(
        userId,
      )}/media?${q.toString()}`
    : `https://graph.instagram.com/me/media?${q.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SEC },
  });
  if (!res.ok) {
    return null;
  }
  const body = (await res.json()) as GraphListResponse;
  if (body.error?.message || !body.data?.length) {
    return null;
  }

  const out: InstagramMediaItem[] = [];
  for (const post of body.data) {
    const imageUrl = pickImageUrl(post);
    if (!imageUrl) continue;
    out.push({
      id: post.id,
      imageUrl,
      permalink: post.permalink,
      caption: post.caption
        ? post.caption.slice(0, 200).replace(/\n/g, " ")
        : null,
    });
  }
  return out.length ? out : null;
}
