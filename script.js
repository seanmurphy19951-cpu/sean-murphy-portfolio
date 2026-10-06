// Ticker content, duplicated for a seamless scrolling loop
const tickerItems = [
  "34% YoY REVENUE GROWTH",
  "4×+ BLENDED PAID MEDIA ROAS",
  "25×+ RETURN · RESELLER CO-OP CAMPAIGN",
  "$2M+ AMAZON CHANNEL SALES, H2",
  "1.3M+ VIEWS · SINGLE INFLUENCER PACKAGE",
  "PGA SHOW · TRADE PRESS · EDITOR'S CHOICE AWARD",
  "META · TIKTOK · GOOGLE · CTV · LINEAR TV",
  "AMAZON · WALMART · RETAIL CO-OP ADVERTISING",
  "AI IMAGE + VIDEO PRODUCTION PIPELINE",
  "50+ CLIENT STORES · +30% REVENUE",
];

const track = document.getElementById("tickerTrack");
if (track) {
  const build = () => tickerItems
    .map(t => `<span><span class="dot">●</span> ${t}</span>`)
    .join("");
  track.innerHTML = build() + build(); // duplicate once for seamless loop
}

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
}

// Scroll reveal: content stays visible if JS or IntersectionObserver is unavailable
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("js");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

// Highlight the nav link for the section in view (home page only)
const sectionLinks = [...document.querySelectorAll('.topnav__links a[href^="index.html#"]')];
if (sectionLinks.length && document.querySelector("#about")) {
  const map = new Map(sectionLinks.map(a => [a.getAttribute("href").split("#")[1], a]));
  const so = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting && map.has(en.target.id)) {
        sectionLinks.forEach(a => a.classList.remove("is-active"));
        map.get(en.target.id).classList.add("is-active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  map.forEach((_, id) => { const el = document.getElementById(id); if (el) so.observe(el); });
}
