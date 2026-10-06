import type { Metadata } from "next";
import { Inter, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Ambient, SmoothScroll } from "@/components/shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Inter_Tight({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-space" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex" });

export const metadata: Metadata = {
  title: "Sean Murphy · E-commerce & Digital Marketing Leader",
  description: "Portfolio of Sean Murphy: paid media, lifecycle email, marketplaces, influencer programs, e-commerce operations and AI workflows.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable} ${plex.variable}`}>
      <body className="bg-bg font-sans">
        <SmoothScroll>
          <Ambient />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
