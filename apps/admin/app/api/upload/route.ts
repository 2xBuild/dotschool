import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { userTags } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

/** Browsers often send "" or application/octet-stream for picked files; map extension to a safe type. */
function resolveImageContentType(file: File): string | null {
  if (file.type && ALLOWED_TYPES.includes(file.type)) {
    return file.type;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const fromExt = ext ? EXT_TO_MIME[ext] : undefined;
  return fromExt ?? null;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * R2_PUBLIC_URL often points at a CDN/custom domain. If the bucket is private, the browser gets a broken <img>.
 * `auto`: HEAD the public URL; if not OK, return an admin-authenticated proxy URL instead.
 * `public` | `proxy`: force one strategy (set R2_BROWSER_ASSET_MODE).
 */
async function resolveBrowserAssetUrl(
  request: Request,
  key: string,
  publicObjectUrl: string,
): Promise<string> {
  const mode = process.env.R2_BROWSER_ASSET_MODE ?? "auto";
  const proxyPath = `/api/r2-media/${encodeURI(key)}`;
  const proxyUrl = new URL(proxyPath, request.url).href;

  if (mode === "proxy") {
    return proxyUrl;
  }
  if (mode === "public") {
    return publicObjectUrl;
  }

  try {
    const head = await fetch(publicObjectUrl, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
    });
    const ok = head.status >= 200 && head.status < 400;
    if (ok) {
      return publicObjectUrl;
    }
    return proxyUrl;
  } catch {
    return proxyUrl;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tags = await db
    .select({ tag: userTags.tag })
    .from(userTags)
    .where(eq(userTags.userId, userId));
  const tagList = tags.map((t) => t.tag);
  if (!tagList.includes("admin") && !tagList.includes("mod")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const contentType = resolveImageContentType(file);
  if (!contentType) {
    return Response.json({ error: "File type not allowed" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const publicUrl = await uploadToR2(buffer, key, contentType);
    const url = await resolveBrowserAssetUrl(request, key, publicUrl);
    return Response.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
