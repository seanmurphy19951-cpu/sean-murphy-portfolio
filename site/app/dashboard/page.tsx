import type { Metadata } from "next";
import { Pager } from "@/components/pager";
import { SiteNav } from "@/components/shell";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Example dashboard · Sean Murphy",
  description: "An AI-built reporting dashboard.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <SiteNav variant="dash" />
      <main className="lg:pl-44">
        <Dashboard />
        <Pager page="dash" />
      </main>
    </>
  );
}
