import { cached, type Cache } from "./cache";
import type { FetchLike, Platform, Post, PostReader } from "./types";

const BASE = "https://api.scrapecreators.com";
const DAY_MS = 24 * 60 * 60 * 1000;

export function platformOf(url: string): Platform | null {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\.|^m\./, "");
  } catch {
    return null;
  }
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (host === "instagram.com") return "instagram";
  if (host === "youtube.com" || host === "youtu.be") return "youtube";
  return null;
}

/**
 * ScrapeCreators (https://docs.scrapecreators.com). Reads both the caption and
 * the transcript: many posts name the show in the caption or on screen and
 * never say it aloud. A failed transcript still returns the caption.
 */
export function createScrapeCreators({
  apiKey,
  fetch: fetchImpl = fetch as unknown as FetchLike,
  cache,
}: {
  apiKey: string;
  fetch?: FetchLike;
  cache?: Cache;
}): PostReader {
  const get = async (path: string, url: string) => {
    const res = await fetchImpl(`${BASE}${path}?url=${encodeURIComponent(url)}`, { headers: { "x-api-key": apiKey } });
    if (!res.ok) throw new Error(`ScrapeCreators HTTP ${res.status}`);
    return (await res.json()) as any;
  };
  const optional = <T>(p: Promise<T>) => p.catch(() => null);

  return {
    read: (url) =>
      cached(
        cache,
        `sc:${url}`,
        async (): Promise<Post | null> => {
          const platform = platformOf(url);
          if (platform === "tiktok") {
            const [video, transcript] = await Promise.all([
              get("/v2/tiktok/video", url),
              optional(get("/v1/tiktok/video/transcript", url)),
            ]);
            const d = video?.aweme_detail;
            return {
              url,
              platform,
              author: d?.author?.unique_id,
              caption: d?.desc ?? "",
              transcript: vttToText(transcript?.transcript ?? ""),
            };
          }
          if (platform === "instagram") {
            const [post, transcript] = await Promise.all([
              get("/v1/instagram/post", url),
              optional(get("/v2/instagram/media/transcript", url)),
            ]);
            const m = post?.data?.xdt_shortcode_media;
            return {
              url,
              platform,
              author: m?.owner?.username,
              caption: m?.edge_media_to_caption?.edges?.[0]?.node?.text ?? "",
              transcript: (transcript?.transcripts ?? []).map((t: { text?: string }) => t.text ?? "").join(" ").trim(),
            };
          }
          if (platform === "youtube") {
            const [video, transcript] = await Promise.all([
              get("/v1/youtube/video", url),
              optional(get("/v1/youtube/video/transcript", url)),
            ]);
            return {
              url,
              platform,
              author: video?.channel?.handle,
              caption: [video?.title, video?.description].filter(Boolean).join("\n"),
              transcript: transcript?.transcript_only_text ?? "",
            };
          }
          return null;
        },
        DAY_MS,
      ),
  };
}

/** WEBVTT → plain words: drop the header, cue numbers and timestamps. */
export function vttToText(vtt: string): string {
  return vtt
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && l !== "WEBVTT" && !/-->/.test(l) && !/^\d+$/.test(l))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
