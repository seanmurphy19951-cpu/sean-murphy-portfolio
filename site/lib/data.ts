import profileJson from "@/data/profile.json";
import casesJson from "@/data/cases.json";

export type Job = { id: string; title: string; company: string; location: string; start: string; end: string; note?: string; bullets: string[] };
export type Case = {
  id: string; employer: string; source: string; tags: string[]; title: string; problem: string; approach: string; result: string;
  stats: [string, string][]; tools: string[]; footnote?: string; link?: [string, string];
};
export const profile = profileJson as unknown as {
  name: string; headline: string; location: string; email: string; linkedin: string;
  experience: Job[]; education: { degree: string; school: string; location: string; date: string }[];
  tools_verified: Record<string, string[]>; skills_technical: string[]; skills_soft: string[];
};
export const cases = (casesJson as unknown as { cases: Case[] }).cases;

export const ROLE_STATS: Record<string, [string, string][]> = {
  uneekor: [["$15M", "Q4 reseller revenue"], ["34%", "YoY revenue growth"], ["4×+", "blended paid media ROAS"], ["$2M+", "Amazon sales, H2"]],
  melton: [["+35%", "CTR"], ["+12%", "AOV"], ["−$3+", "CPA"]],
  pacific: [["+40%", "YoY sales"], ["+10", "first-page keywords"]],
  // TODO(Sean): PLACEHOLDER Aldi figures; replace with real ones.
  aldi: [["3rd", "in region for sales"], ["+14%", "peak-season sales vs last year"], ["98%+", "stock accuracy"], ["+12%", "rebuild relaunch week vs target"]],
  shopwired: [["+30%", "revenue across 50+ clients"], ["+$5,000", "new MoM revenue line"]],
};
export const ROLE_INTRO: Record<string, string> = {
  uneekor: "Golf simulator and launch-monitor brand selling direct, on Amazon, and through a reseller network.",
  melton: "Fishing tackle retailer and distributor; on-site e-commerce merchandising.",
  pacific: "Training and education company; sole owner of e-commerce (freelance).",
  shopwired: "UK e-commerce platform; client store work across 50+ merchants.",
  aldi: "UK discount grocer; store operations, seasonal activations and stock control, where I learned how retail targets are won.",
};
export const HERO_STATS: [string, string][] = [
  ["$15M", "Q4 reseller revenue"], ["4×+", "blended paid ROAS"], ["$2M+", "Amazon sales, H2"], ["50+", "client stores grown"],
];
export const MARQUEE = [
  "Paid media", "Lifecycle email", "Amazon & marketplaces", "Reseller co-op programs", "Influencer programs", "CTV & linear TV",
  "Meta · TikTok · Google", "SEO", "Trade shows & events", "AI image + video production", "E-commerce operations", "Shopify · WooCommerce · BigCommerce",
];
export const NAV = [
  { id: "top", label: "Intro" }, { id: "about", label: "About" }, { id: "featured", label: "Highlights" }, { id: "work", label: "Work" },
  { id: "experience", label: "Experience" }, { id: "recognition", label: "Recognition" }, { id: "skills", label: "Skills" }, { id: "contact", label: "Contact" },
];

export const AI_NAV = [
  { id: "top", label: "Intro" }, { id: "automations", label: "Automations" }, { id: "builds", label: "Builds" }, { id: "stack", label: "MCP & CLI" },
  { id: "pipeline", label: "Workflow" }, { id: "imagery", label: "Imagery" }, { id: "principles", label: "Principles" },
];
export const CONTENT_NAV = [
  { id: "top", label: "Intro" }, { id: "ads", label: "Ads" }, { id: "email", label: "Email" }, { id: "seo", label: "SEO" },
  { id: "more", label: "More" }, { id: "growth", label: "Growth" },
];
export const WORK_NAV: { id: string; label: string }[] = [];
