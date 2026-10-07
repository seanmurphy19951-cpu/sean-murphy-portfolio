import type { MetadataRoute } from "next";

const PATHS = ["", "/work", "/ai", "/content", "/dashboard", "/okr"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({ url: `https://seanmurphy.site${p}` }));
}
