import type { Metadata } from "next";
import { Pager } from "@/components/pager";
import { SiteNav } from "@/components/shell";
import { Okr } from "@/components/okr/okr";

export const metadata: Metadata = {
  title: "Example OKR · Sean Murphy",
  description: "An example quarterly OKR scorecard with invented data.",
  alternates: { canonical: "/okr" },
};

export default function Page() {
  return (
    <>
      <SiteNav variant="okr" />
      <main className="lg:pl-0">
        <Okr />
        <Pager page="okr" />
      </main>
    </>
  );
}
