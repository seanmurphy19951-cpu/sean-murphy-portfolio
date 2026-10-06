import type { Metadata } from "next";
import { FloatingNav } from "@/components/shell";
import { AiContent } from "@/components/sections/ai-content";

export const metadata: Metadata = {
  title: "AI & Content · Sean Murphy",
  description: "AI and automation in practice: AI-produced imagery and video, brand films, ad and email creative, and the growth it supported.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <FloatingNav variant="ai" />
      <AiContent />
    </>
  );
}
