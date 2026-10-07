import type { Metadata } from "next";
import { SiteNav } from "@/components/shell";
import { Ai } from "@/components/sections/ai";

export const metadata: Metadata = {
  title: "AI · Sean Murphy",
  description: "AI and automation in practice: automations, AI-built tools, MCP and CLI workflows, and AI-produced imagery.",
  alternates: { canonical: "/ai" },
};

export default function Page() {
  return (
    <>
      <SiteNav variant="ai" />
      <div className="lg:pl-44"><Ai /></div>
    </>
  );
}
