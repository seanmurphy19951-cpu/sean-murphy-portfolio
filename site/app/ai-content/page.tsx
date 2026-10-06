import type { Metadata } from "next";
import { SiteNav } from "@/components/shell";
import { AiContent } from "@/components/sections/ai-content";

export const metadata: Metadata = {
  title: "AI & Content · Sean Murphy",
  description: "AI and automation in practice: AI-produced imagery and video, brand films, ad and email creative, and the growth it supported.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <SiteNav variant="ai" />
      <div className="lg:pl-44"><AiContent /></div>
    </>
  );
}
