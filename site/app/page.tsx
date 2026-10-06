import { FloatingNav } from "@/components/shell";
import { About, Hero } from "@/components/sections/hero-about";
import { Work } from "@/components/sections/work";
import { Contact, Experience, Recognition, Skills } from "@/components/sections/rest";

export default function Home() {
  return (
    <main>
      <FloatingNav />
      <Hero />
      <About />
      <Work />
      <Experience />
      <Recognition />
      <Skills />
      <Contact />
    </main>
  );
}
