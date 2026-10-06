import { FloatingNav } from "@/components/shell";
import { About, Hero } from "@/components/sections/hero-about";
import { Featured } from "@/components/sections/featured";
import { Work } from "@/components/sections/work";
import { Contact, Experience, Recognition, Skills } from "@/components/sections/rest";

export default function Home() {
  return (
    <main>
      <FloatingNav />
      <Hero />
      <About />
      <Featured />
      <Work />
      <Experience />
      <Recognition />
      <Skills />
      <Contact />
    </main>
  );
}
