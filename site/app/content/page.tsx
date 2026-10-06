import type { Metadata } from "next";
import { SiteNav } from "@/components/shell";
import { Content } from "@/components/sections/content";

export const metadata: Metadata = {
  title: "Content · Sean Murphy",
  description: "Photo shoots, ad creative, email and lifecycle, and the growth they supported.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <SiteNav variant="content" />
      <div className="lg:pl-44"><Content /></div>
    </>
  );
}
