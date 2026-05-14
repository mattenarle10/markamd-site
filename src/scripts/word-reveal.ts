// scroll-scrubbed word-by-word reveal for headings tagged `[data-words]`.
// each <span class="word"> inside fades up from translateY(24px) opacity 0
// to opacity 1 as the section scrolls into view. left-to-right cascade.
// reverses on scroll-up. respects prefers-reduced-motion.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function setup() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll<HTMLElement>("[data-words]");
  if (targets.length === 0) return;

  gsap.registerPlugin(ScrollTrigger);

  targets.forEach((heading) => {
    const words = Array.from(heading.querySelectorAll<HTMLElement>(".word"));
    if (words.length === 0) return;

    if (reduced) {
      gsap.set(words, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(words, { opacity: 0, y: 24 });

    gsap.to(words, {
      opacity: 1,
      y: 0,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: heading,
        start: "top 88%",
        end: "top 35%",
        scrub: 0.6,
      },
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup, { once: true });
} else {
  setup();
}
