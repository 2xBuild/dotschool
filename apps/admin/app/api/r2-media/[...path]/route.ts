import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { userTags } from "@/server/db/schema";
import { eq } from "drizzle-orm";

import { getR2ObjectStream } from "@/lib/r2";

export const dynamic = "force-dynamic";

async function requireModOrAdmin(): Promise<Response | null> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const tags = await db
    .select({ tag: userTags.tag })
    .from(userTags)
    .where(eq(userTags.userId, userId));
  const tagList = tags.map((t) => t.tag);
  if (!tagList.includes("admin") && !tagList.includes("mod")) {
    return new Response("Forbidden", { status: 403 });
  }
  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const denied = await requireModOrAdmin();
  if (denied) return denied;

  const { path: segments } = await context.params;
  if (!segments?.length) {
    return new Response("Not found", { status: 404 });
  }
  if (segments.some((s) => s === "" || s === "." || s === "..")) {
    return new Response("Bad request", { status: 400 });
  }
  const key = segments.join("/");

  try {
    const obj = await getR2ObjectStream(key);
    if (!obj) {
      return new Response("Not found", { status: 404 });
    }
    const stream = obj.body.transformToWebStream();
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": obj.contentType,
        ...(obj.cacheControl
          ? { "Cache-Control": obj.cacheControl }
          : { "Cache-Control": "private, max-age=3600" }),
      },
    });
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    const msg = e instanceof Error ? e.message : "";
    if (name === "NoSuchKey" || msg.includes("NoSuchKey")) {
      return new Response("Not found", { status: 404 });
    }
    return new Response("Error", { status: 500 });
  }
}
