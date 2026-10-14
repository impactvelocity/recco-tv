// Everything on the page is fictional: mock titles with original posters, made-up
// names, a reserved 555 number. Same stand-ins as the demo film (brag-output/brag-plan.md).

export const REPO_URL = "https://github.com/impactvelocity/recco-tv";
export const YOUTUBE_ID = "J1pppa0i8ds";
export const YOUTUBE_URL = `https://www.youtube.com/watch?v=${YOUTUBE_ID}`;
export const RECCO_NUMBER = "(604) 555-0142";
export const PAIRING_CODE = "48217";

/** TV themes, exact values from docs/design/README.md. */
export type ThemeKey =
  | "winterNight"
  | "winterDay"
  | "fallDay"
  | "fallNight"
  | "summerDay"
  | "summerNight";

export type Theme = {
  key: ThemeKey;
  label: string;
  canvas: string;
  surface: string; // "r,g,b"
  focus: string;
  accent: string;
  accent2: string;
  onAccent: string;
  text: string;
  text2: string;
  segOn: string;
  segOnFg: string;
  tint: [string, string];
};

export const THEMES: Theme[] = [
  {
    key: "winterNight",
    label: "Winter night",
    canvas: "#152A43",
    surface: "13,28,43",
    focus: "#8FBDE8",
    accent: "#789ECC",
    accent2: "#8FBDE8",
    onAccent: "#10233A",
    text: "#F8FBFD",
    text2: "#BBCAD6",
    segOn: "#8FBDE8",
    segOnFg: "#10233A",
    tint: ["rgba(120,158,204,.4)", "rgba(175,201,232,.2)"],
  },
  {
    key: "fallDay",
    label: "Fall day",
    canvas: "#555740",
    surface: "41,54,45",
    focus: "#F0B667",
    accent: "#D3632D",
    accent2: "#F0B667",
    onAccent: "#2A1A10",
    text: "#FFF7E8",
    text2: "#D5CFB9",
    segOn: "#F0B667",
    segOnFg: "#2A1A10",
    tint: ["rgba(211,99,45,.42)", "rgba(240,182,103,.22)"],
  },
  {
    key: "fallNight",
    label: "Fall night",
    canvas: "#1D2929",
    surface: "18,28,30",
    focus: "#E28A3B",
    accent: "#C8572F",
    accent2: "#E28A3B",
    onAccent: "#1D1410",
    text: "#FFF6E8",
    text2: "#C4CAC0",
    segOn: "#E28A3B",
    segOnFg: "#1D1410",
    tint: ["rgba(200,87,47,.42)", "rgba(226,138,59,.22)"],
  },
  {
    key: "winterDay",
    label: "Winter day",
    canvas: "#71889B",
    surface: "38,54,66",
    focus: "#8CC8D8",
    accent: "#516B7B",
    accent2: "#8CC8D8",
    onAccent: "#263642",
    text: "#FFFDF8",
    text2: "#D9E1E4",
    segOn: "#8CC8D8",
    segOnFg: "#263642",
    tint: ["rgba(94,117,108,.55)", "rgba(175,200,216,.3)"],
  },
  {
    key: "summerDay",
    label: "Summer day",
    canvas: "#5EA7B6",
    surface: "25,76,86",
    focus: "#F2D34F",
    accent: "#D7683D",
    accent2: "#F2D34F",
    onAccent: "#2A1A10",
    text: "#FFFDF7",
    text2: "#D5ECEA",
    segOn: "#D7683D",
    segOnFg: "#FFFDF7",
    tint: ["rgba(215,104,61,.5)", "rgba(231,211,174,.25)"],
  },
  {
    key: "summerNight",
    label: "Summer night",
    canvas: "#174D68",
    surface: "11,41,56",
    focus: "#F0A64B",
    accent: "#83BCD4",
    accent2: "#F0A64B",
    onAccent: "#0B2938",
    text: "#F8FCFC",
    text2: "#BDD9DF",
    segOn: "#83BCD4",
    segOnFg: "#0B2938",
    tint: ["rgba(131,188,212,.4)", "rgba(31,91,114,.35)"],
  },
];

export type Card = {
  id: string;
  title: string;
  meta: string;
  imdb?: string;
  rt?: string;
  message: string;
  from: string[];
  time: string;
  poster?: string;
  stack?: { count: number; source: string; posters: string[] };
};

export const INBOX: Card[] = [
  {
    id: "cozy",
    title: "3 cozy comedies for a night in",
    meta: "",
    message: "my three comfort shows when it's cold out",
    from: ["Steph"],
    time: "now",
    stack: {
      count: 3,
      source: "FilmTok",
      posters: ["room-104", "couch-time", "away-game"],
    },
  },
  {
    id: "garage",
    title: "Two-Car Garage",
    meta: "Series · 1998–2007",
    imdb: "7.4",
    rt: "65%",
    message: "Jill says it's hilarious",
    from: ["Jill"],
    time: "now",
    poster: "two-car-garage",
  },
  {
    id: "desk",
    title: "Desk Nine",
    meta: "Series · 2022–",
    imdb: "8.2",
    rt: "98%",
    message: "Dad says it's brilliant",
    from: ["Dad"],
    time: "1m ago",
    poster: "desk-nine",
  },
  {
    id: "house",
    title: "Back of House",
    meta: "Series · 2022–",
    imdb: "8.5",
    rt: "99%",
    message: "you HAVE to watch Back of House, the one-take kitchen episode is insane",
    from: ["Sarah", "Dad"],
    time: "5h ago",
    poster: "back-of-house",
  },
  {
    id: "floor",
    title: "Floor Thirteen",
    meta: "Series · 2022–",
    imdb: "8.7",
    rt: "97%",
    message: "Floor Thirteen!! your dad and I are hooked",
    from: ["Mom", "Sarah"],
    time: "Tue",
    poster: "floor-thirteen",
  },
  {
    id: "summer",
    title: "Second Summer",
    meta: "Film · 2023",
    imdb: "7.8",
    rt: "95%",
    message: "Best films of 2023 you probably missed",
    from: ["From the internet"],
    time: "Sun",
    poster: "second-summer",
  },
];

/** "What the agent handles", from the README. */
export const EXAMPLES: { text: string; result: string; detail: string }[] = [
  {
    text: "Two-Car Garage - Jill said it was hilarious",
    result: "A card under Jill",
    detail: "with her note, in her words",
  },
  {
    text: "Floor Thirteen",
    result: "A card under “From me”",
    detail: "a note to yourself",
  },
  {
    text: "filmtok.cx/@steph/74… Steph sent this",
    result: "One card per show in the post",
    detail: "stacked together, under Steph",
  },
  {
    text: "reelhub.cx/watch?v=8hQ…",
    result: "Cards under “From the internet”",
    detail: "a bare link with no name",
  },
  {
    text: "movies for a stormy night",
    result: "A stack of ideas",
    detail: "under “Recco’s picks”, each one checked",
  },
  {
    text: "that show with the guy in the bunker",
    result: "The show you meant",
    detail: "a half-remembered title is still a title",
  },
  {
    text: "the garage one",
    result: "A “Which one?” card",
    detail: "up to three candidates to pick with the remote",
  },
  {
    text: "zzzz",
    result: "An unsorted note",
    detail: "Recco never invents a title",
  },
];

export type Service = { name: string; aws?: boolean };

export const PIPELINE: {
  title: string;
  body: string;
  uses: Service[];
}[] = [
  {
    title: "The text arrives",
    body: "The SMS provider calls a signed webhook. The API checks the signature and publishes the text to SNS in the AWS End User Messaging shape, so a number from AWS can replace the provider without a code change.",
    uses: [
      { name: "Zernio SMS" },
      { name: "Lambda function URL", aws: true },
      { name: "Amazon SNS", aws: true },
      { name: "Amazon SQS", aws: true },
    ],
  },
  {
    title: "Intake sorts it out",
    body: "A five-digit code links the phone to that TV. A phone that isn't linked is dropped. Anything else is saved, and the TV shows a placeholder in under a second.",
    uses: [
      { name: "AWS Lambda", aws: true },
      { name: "Amazon DynamoDB", aws: true },
      { name: "AWS AppSync Events", aws: true },
    ],
  },
  {
    title: "A worker starts the agent",
    body: "Intake hands off without waiting. The worker calls the agent on AgentCore Runtime, one session per text.",
    uses: [
      { name: "AWS Lambda", aws: true },
      { name: "Bedrock AgentCore Runtime", aws: true },
    ],
  },
  {
    title: "The Recco agent reads it",
    body: "It waits five seconds for follow-up texts, because a link and its comment often arrive as two. Then it works through four tools and calls save_cards once.",
    uses: [
      { name: "Bedrock AgentCore Runtime", aws: true },
      { name: "Vercel AI SDK" },
      { name: "Claude Haiku 5.5" },
      { name: "OMDb API" },
    ],
  },
  {
    title: "save_cards checks the work",
    body: "Plain code, not the model. Cards that pass are written and the TV swaps the placeholder for the finished card.",
    uses: [
      { name: "TypeScript" },
      { name: "Amazon DynamoDB", aws: true },
      { name: "AWS AppSync Events", aws: true },
    ],
  },
];

export const TOOLS: { name: string; body: string; via: string }[] = [
  {
    name: "read_post",
    body: "Reads a link from the text: a post's caption and transcript, or a web page. It only opens links that are in your text.",
    via: "ScrapeCreators · Jina Reader",
  },
  {
    name: "find_titles",
    body: "Looks up each title in OMDb and returns real matches. For a misspelled title it tries again, up to three times per show.",
    via: "OMDb · 7-day cache in DynamoDB",
  },
  {
    name: "list_friends",
    body: "Lists the friends this household already has, so “steph” is filed under the Steph you already have.",
    via: "Amazon DynamoDB",
  },
  {
    name: "save_cards",
    body: "Checks every card, saves the ones that pass, and tells the TV.",
    via: "DynamoDB · AppSync Events",
  },
];

export const GUARDS: { label: string; rule: string }[] = [
  {
    label: "Every title",
    rule: "Must come from find_titles in this run. Anything else is rejected.",
  },
  {
    label: "The note",
    rule: "Must be your exact words. If the model rewords it, your whole text is kept.",
  },
  {
    label: "The friend",
    rule: "Must be named in your text. Names from a post are dropped.",
  },
  {
    label: "If nothing matches",
    rule: "Your words are saved as a note. Recco never invents a title.",
  },
];

export const STATS: { value: string; unit: string; label: string; budget: string }[] = [
  { value: "0.75", unit: "s", label: "Placeholder on the TV after you hit send", budget: "budget 3 s" },
  { value: "~5", unit: "s", label: "Finished card from a plain text", budget: "budget 20 s" },
  { value: "10.2", unit: "s", label: "Finished card from a link, read live", budget: "budget 45 s" },
  { value: "108", unit: "ms", label: "GET /inbox at p95", budget: "budget 500 ms" },
  { value: "25/25", unit: "", label: "Agent test set of real-shaped texts and links", budget: "Claude Haiku 5.5" },
];

export const AWS_SERVICES = [
  "Bedrock AgentCore Runtime",
  "AWS Lambda",
  "Amazon SNS",
  "Amazon SQS",
  "Amazon DynamoDB",
  "AWS AppSync Events",
  "AWS Secrets Manager",
  "Amazon S3",
  "AWS IAM",
  "Amazon CloudWatch Logs",
  "AWS CDK",
];

export const OTHER_STACK = [
  "React Native for Vega",
  "Hono",
  "Vercel AI SDK",
  "Vercel AI Gateway",
  "Claude Haiku 5.5",
  "OMDb",
  "ScrapeCreators",
  "Jina Reader",
  "Zernio SMS",
];
