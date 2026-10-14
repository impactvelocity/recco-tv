import { cached, type Cache } from "./cache";
import type { FetchLike, Post, PostReader } from "./types";

const BASE = "https://r.jina.ai/";
const DAY_MS = 24 * 60 * 60 * 1000;
/** Enough for an article or a title page; keeps cache items small. */
const MAX_CONTENT = 12_000;

/**
 * Jina Reader (https://jina.ai/reader). Reads any web page that is not a
 * TikTok, Instagram or YouTube post: articles, IMDb, Letterboxd, Wikipedia.
 * Jina fetches the page, not us. The page's title and description become the
 * caption and its text the transcript.
 */
export function createJinaReader({
  apiKey,
  fetch: fetchImpl = fetch as unknown as FetchLike,
  cache,
}: {
  apiKey: string;
  fetch?: FetchLike;
  cache?: Cache;
}): PostReader {
  return {
    read: (url) =>
      cached(
        cache,
        `jina:${url}`,
        async (): Promise<Post | null> => {
          if (!/^https?:\/\//i.test(url)) return null;
          const res = await fetchImpl(`${BASE}${url}`, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/json",
              "X-Retain-Images": "none",
              "X-Md-Link-Style": "discarded",
              "X-Timeout": "15",
            },
          });
          if (!res.ok) throw new Error(`Jina Reader HTTP ${res.status}`);
          const body = (await res.json()) as any;
          const d = body?.data;
          // httpStatus is the page's own status: a 404 page still comes back as code 200.
          if (body?.code !== 200 || !d || (typeof d.httpStatus === "number" && d.httpStatus >= 400)) return null;
          const content = typeof d.content === "string" ? mainText(d.content) : "";
          if (!content && !d.title) return null;
          return {
            url,
            platform: "web",
            caption: [d.title, d.description].filter((s) => typeof s === "string" && s.trim()).join("\n"),
            transcript: content.slice(0, MAX_CONTENT),
          };
        },
        DAY_MS,
      ),
  };
}

/**
 * The page from its main heading on, with blank lines squeezed. Sites like
 * IMDb put a long menu before the heading, which would otherwise use up the
 * text the agent sees before the list starts.
 */
export function mainText(content: string): string {
  const heading = content.search(/^# \S/m);
  const from = heading > 0 && heading < content.length / 2 ? content.slice(heading) : content;
  return from.replace(/\n[ \t]*(?=\n)/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
