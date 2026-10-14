import type { TitleFacts, TitleType } from "@recco/core";

/** One title as the lookup returns it. Every card's title id comes from here. */
export interface TitleCandidate extends TitleFacts {
  imdbId: string;
  title: string;
  year?: string;
  type: TitleType;
  plot?: string;
  posterUrl?: string;
}

export interface TitleQuery {
  title: string;
  year?: string;
  type?: "movie" | "series";
}

export interface TitleLookup {
  /** Up to five matches, best first. */
  search(query: TitleQuery): Promise<TitleCandidate[]>;
  details(imdbId: string): Promise<TitleCandidate | null>;
}

/** "web" is any other page, read through Jina Reader. */
export type Platform = SocialPlatform | "web";
export type SocialPlatform = "tiktok" | "instagram" | "youtube";

export interface Post {
  url: string;
  platform: Platform;
  author?: string;
  /** Caption, or title and description for YouTube. */
  caption: string;
  /** Spoken words, if any. Many posts name the show only on screen or in the caption. */
  transcript: string;
}

export interface PostReader {
  /** Null when the link is not a supported post or cannot be read. */
  read(url: string): Promise<Post | null>;
}

export interface Sources {
  titles: TitleLookup;
  posts: PostReader;
}

export type FetchLike = (url: string, init?: { headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;
