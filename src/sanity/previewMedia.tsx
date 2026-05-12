/**
 * Returns a preview thumbnail for Sanity Studio's document list. If an
 * external URL is provided, renders an <img>; otherwise falls back to the
 * uploaded image asset reference (which Sanity renders natively).
 */
export function externalMedia(url: string | undefined, imageAsset: any): any {
  if (!url) return imageAsset;
  const normalizedUrl =
    url.startsWith("/") || /^https?:\/\//i.test(url) ? url : `https://${url}`;

  function MediaThumb() {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={normalizedUrl}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        referrerPolicy="no-referrer"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return MediaThumb;
}
