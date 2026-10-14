/**
 * Responses in the shapes the real APIs return (trimmed), for client tests.
 * Shapes follow each provider's docs: OMDb,
 * ScrapeCreators OpenAPI examples.
 */
export const OMDB_SEARCH_OFFICE = {
  Search: [
    { Title: "The Office", Year: "2005–2013", imdbID: "tt0386676", Type: "series", Poster: "https://m.media-amazon.com/images/M/office-us.jpg" },
    { Title: "The Office", Year: "2001–2003", imdbID: "tt0290978", Type: "series", Poster: "N/A" },
    { Title: "The Office Christmas Party", Year: "2016", imdbID: "tt1711525", Type: "movie", Poster: "N/A" },
    { Title: "The Office: Lego Game", Year: "2019", imdbID: "tt9999999", Type: "game", Poster: "N/A" },
  ],
  totalResults: "4",
  Response: "True",
};

export const OMDB_TITLE_OFFICE_US = {
  Title: "The Office",
  Year: "2005–2013",
  Type: "series",
  Plot: "A mockumentary on a group of typical office workers.",
  Poster: "https://m.media-amazon.com/images/M/office-us.jpg",
  Runtime: "22 min",
  Genre: "Comedy",
  imdbRating: "9.0",
  Ratings: [
    { Source: "Internet Movie Database", Value: "9.0/10" },
    { Source: "Rotten Tomatoes", Value: "81%" },
  ],
  imdbID: "tt0386676",
  Response: "True",
};

export const OMDB_TITLE_OFFICE_UK = { ...OMDB_TITLE_OFFICE_US, Year: "2001–2003", imdbID: "tt0290978", Poster: "N/A", Plot: "The story of an office.", Ratings: [], imdbRating: "N/A", Runtime: "N/A", Genre: "Comedy, Drama" };

export const OMDB_NOT_FOUND = { Response: "False", Error: "Movie not found!" };

export const SC_TIKTOK_VIDEO = {
  success: true,
  aweme_detail: { aweme_id: "1", desc: "3 shows to binge this weekend #tv", author: { unique_id: "tvtok", nickname: "TV Tok" } },
};

export const SC_TIKTOK_TRANSCRIPT = {
  success: true,
  transcript: "WEBVTT\n\n\n00:00:00.120 --> 00:00:01.840\nNumber one, Severance.\n\n00:00:01.841 --> 00:00:03.761\nNumber two, The Bear.\n",
};

export const SC_INSTAGRAM_POST = {
  success: true,
  data: {
    xdt_shortcode_media: {
      owner: { username: "filmgram", full_name: "Film Gram" },
      edge_media_to_caption: { edges: [{ node: { text: "Past Lives (2023) wrecked me" } }] },
    },
  },
};

export const SC_INSTAGRAM_TRANSCRIPT = { success: true, transcripts: [{ id: "1", text: "This one is about two friends." }] };

export const SC_YOUTUBE_VIDEO = {
  success: true,
  title: "Best crime shows",
  description: "Slow Horses and Fargo",
  channel: { handle: "crimetv", title: "Crime TV" },
};

export const SC_YOUTUBE_TRANSCRIPT = { success: true, transcript_only_text: "first slow horses then fargo the series" };
