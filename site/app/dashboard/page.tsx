import type { Metadata } from "next";
import { SiteNav } from "@/components/shell";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Dashboard · Sean Murphy",
  description: "An AI-built reporting dashboard.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <SiteNav variant="dash" />
      <main className="pt-16 lg:pl-44">
        <Dashboard />
      </main>
    </>
  );
}
