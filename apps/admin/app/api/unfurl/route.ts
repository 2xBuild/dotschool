import { auth } from "@/server/auth/config";

const TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 128_000;

function extractMeta(html: string) {
  const get = (property: string): string | null => {
    const re = new RegExp(
      `<meta\\s+(?:[^>]*?(?:property|name)=["']${property}["'][^>]*?content=["']([^"']*?)["']|[^>]*?content=["']([^"']*?)["'][^>]*?(?:property|name)=["']${property}["'])`,
      "i",
    );
    const m = html.match(re);
    return m?.[1] ?? m?.[2] ?? null;
  };

  const title =
    get("og:title") ??
    get("twitter:title") ??
    html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ??
    null;

  const description =
    get("og:description") ??
    get("twitter:description") ??
    get("description") ??
    null;

  const image = get("og:image") ?? get("twitter:image") ?? null;

  const siteName = get("og:site_name") ?? null;

  return { title, description, image, siteName };
}

export async function GET(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return Response.json({ error: "url parameter required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return Response.json({ error: "Only http/https URLs" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DotSchoolBot/1.0)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      return Response.json(
        { error: `Fetch failed: ${res.status}` },
        { status: 502 },
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return Response.json(
        { error: "Not an HTML page" },
        { status: 422 },
      );
    }

    const buffer = await res.arrayBuffer();
    const html = new TextDecoder().decode(buffer.slice(0, MAX_HTML_BYTES));

    const meta = extractMeta(html);

    if (meta.image && !meta.image.startsWith("http")) {
      try {
        meta.image = new URL(meta.image, url).href;
      } catch {
        meta.image = null;
      }
    }

    return Response.json({
      url,
      title: meta.title,
      description: meta.description,
      image: meta.image,
      siteName: meta.siteName ?? parsed.hostname.replace(/^www\./, ""),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fetch failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}
