import type { Metadata } from "next";
import { SiteNav } from "@/components/shell";
import { WorkPage } from "@/components/sections/work";

export const metadata: Metadata = {
  title: "Work · Sean Murphy",
  description: "Case studies with the problem, approach and result.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <SiteNav variant="work" />
      <div className="lg:pl-44"><WorkPage /></div>
    </>
  );
}
