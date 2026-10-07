/** All figures and names on this page are invented, for illustration only. */
export type Fmt = "usd" | "num" | "pct" | "x";
export type Measure = {
  id: string; name: string; owner: string; fmt: Fmt; target: number;
  /** "sum" adds up week by week; "level" is a reading that moves up or down. */
  kind: "sum" | "level"; start?: number; end: number; commit: "Committed" | "Aspirational"; note: string;
};
export type Objective = { n: string; title: string; goal: string; owner: string; measures: Measure[]; drivers: { name: string; owner: string; status: string; stats: [string, string][]; note: string }[]; actions: string[] };

export const BRANDS = ["Northwind", "Alder & Co", "Harbor Lane", "Pinecrest"] as const;
export const SHARE: Record<string, number> = { Northwind: 0.46, "Alder & Co": 0.29, "Harbor Lane": 0.15, Pinecrest: 0.1 };
export const WEEKS = 13;
export const CURRENT_WEEK = 9;
/** Shape of a typical quarter: share of the final total reached by the end of each week. */
export const CURVE = [0.05, 0.11, 0.17, 0.23, 0.3, 0.37, 0.44, 0.52, 0.61, 0.7, 0.79, 0.89, 1];
/** Small week-to-week wobble so the bars look real. */
export const WOBBLE = [1.1, 0.9, 1.05, 0.95, 1.12, 0.88, 1.04, 0.97, 1.08, 1, 1, 1, 1];

export const OBJECTIVES: Objective[] = [
  {
    n: "01", title: "Profitable ads", goal: "Get more sales from ads without overspending", owner: "Sam",
    measures: [
      { id: "m1", name: "Sales from ads", owner: "Sam", fmt: "usd", target: 72000, kind: "sum", end: 76800, commit: "Committed", note: "As Google Ads and Meta report them" },
      { id: "m2", name: "Return on ad spend", owner: "Sam", fmt: "x", target: 3.5, kind: "level", start: 2.9, end: 3.8, commit: "Committed", note: "Ad sales divided by ad spend" },
    ],
    drivers: [
      { name: "Search campaigns", owner: "Sam", status: "Live", stats: [["Campaigns live", "14"], ["Monthly spend", "$6.2K"], ["Top return", "5.1×"]], note: "Branded and shopping campaigns carry most of the return." },
    ],
    actions: ["Move budget from the two weakest campaigns into shopping", "Hold spend flat until the return is above 3.5× for two weeks"],
  },
  {
    n: "02", title: "Convert visitors", goal: "Turn more website visitors into buyers", owner: "Sam",
    measures: [
      { id: "m3", name: "Other website sales", owner: "Sam", fmt: "usd", target: 58000, kind: "sum", end: 51400, commit: "Aspirational", note: "Website sales not credited to ads or email" },
      { id: "m4", name: "Share of visitors who buy", owner: "Sam", fmt: "pct", target: 1.5, kind: "level", start: 1.18, end: 1.46, commit: "Aspirational", note: "Real visits only, bots removed" },
      { id: "m5", name: "Reviews collected", owner: "Riley", fmt: "num", target: 125, kind: "sum", end: 138, commit: "Committed", note: "Review app, all brands" },
    ],
    drivers: [
      { name: "Review requests", owner: "Riley", status: "Live", stats: [["Requests sent", "612"], ["Reviews", "138"], ["Average rating", "4.4"]], note: "Request goes out five days after delivery." },
      { name: "Checkout tests", owner: "Sam", status: "In progress", stats: [["Tests run", "3"], ["Winners", "1"], ["Lift", "+0.12 pts"]], note: "Shipping-cost message tested above the cart." },
    ],
    actions: ["Show review stars on collection pages", "Test free-shipping threshold at $75 vs $90"],
  },
  {
    n: "03", title: "Audience that buys", goal: "Grow our audience and marketplace sales", owner: "Riley",
    measures: [
      { id: "m6", name: "Marketplace sales", owner: "Jordan / Riley", fmt: "usd", target: 28000, kind: "sum", end: 31900, commit: "Aspirational", note: "Orders from the social marketplace store" },
      { id: "m7", name: "Followers on Instagram and TikTok", owner: "Riley", fmt: "num", target: 6000, kind: "level", start: 3900, end: 6350, commit: "Aspirational", note: "Public counts, all brands" },
      { id: "m8", name: "Posts creators make about us", owner: "Riley", fmt: "num", target: 100, kind: "sum", end: 84, commit: "Committed", note: "Tagged posts on Instagram" },
    ],
    drivers: [
      { name: "Creator gifting", owner: "Riley", status: "Live", stats: [["Creators contacted", "410"], ["Products gifted", "64"], ["Posts", "84"]], note: "Gifting focused on the two largest brands." },
    ],
    actions: ["Double creator outreach for Harbor Lane", "Post twice a day per brand"],
  },
  {
    n: "04", title: "Email revenue", goal: "Make email a steady source of sales", owner: "Riley",
    measures: [
      { id: "m9", name: "Sales from email", owner: "Riley", fmt: "usd", target: 32000, kind: "sum", end: 29600, commit: "Aspirational", note: "Campaigns and welcome / cart flows only" },
      { id: "m10", name: "New email sign-ups (real people)", owner: "Riley", fmt: "num", target: 850, kind: "sum", end: 902, commit: "Committed", note: "Bot sign-ups filtered out" },
    ],
    drivers: [
      { name: "Lifecycle flows", owner: "Riley", status: "Live", stats: [["Flows live", "6"], ["Flow sales", "$18.4K"], ["Click rate", "2.1%"]], note: "Welcome and abandoned-cart flows earn most of the revenue." },
    ],
    actions: ["Send the planned weekly campaign for each brand", "Test a stronger subject line on the next promo"],
  },
  {
    n: "05", title: "Free search traffic", goal: "Get more free visitors from Google", owner: "Sam",
    measures: [
      { id: "m11", name: "Google visits from people not searching our name", owner: "Sam", fmt: "num", target: 2000, kind: "sum", end: 2280, commit: "Committed", note: "Search queries without the brand names" },
      { id: "m12", name: "Sales from free Google results", owner: "Sam", fmt: "usd", target: 40000, kind: "sum", end: 36100, commit: "Committed", note: "Includes free shopping listings" },
      { id: "m13", name: "Featured articles", owner: "Jordan", fmt: "num", target: 10, kind: "sum", end: 6, commit: "Committed", note: "Articles live and indexed" },
    ],
    drivers: [
      { name: "Style guide articles", owner: "Jordan", status: "In progress", stats: [["Live", "29"], ["Scheduled", "42"], ["Visits", "3.1K"]], note: "Three articles a week per brand." },
    ],
    actions: ["Keep the scheduled articles going live", "Rewrite the five top collection pages"],
  },
];

export const HEALTH: [string, string][] = [
  ["Share of checkouts completed", "44.2%"], ["Share of sales returned or refunded", "9.8%"],
  ["Share of orders from repeat customers", "21.5%"], ["Average review rating", "4.4"],
];
