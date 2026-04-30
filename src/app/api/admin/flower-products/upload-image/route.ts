import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAdminAccess, requireWritableAdmin } from "@/lib/adminAccess";
import { sanityWriteClient } from "@/sanity/writeClient";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const session = await auth();
  const access = getAdminAccess(session);
  const writable = requireWritableAdmin(access);
  if (writable) return writable;
  if ("error" in access) return access.error;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  const type = (file.type || "").toLowerCase();
  if (!ALLOWED.has(type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, or GIF images are allowed" },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be between 1 byte and 8 MB" }, { status: 400 });
  }

  const asset = await sanityWriteClient.assets.upload("image", buf, {
    filename: file.name || "product-image",
    contentType: type || "image/jpeg",
  });

  return NextResponse.json({
    assetId: asset._id,
    url: typeof asset.url === "string" ? asset.url : undefined,
  });
}
