// hero ambient — three soft accent orbs drift slowly behind the hero.
// each orb runs its own yoyo loop on x/y/scale with distinct durations
// + delays so they never sync up. on scroll past the hero, the orb
// container parallaxes upward so they leave the viewport cleanly.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function setup() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const orbsWrap = document.querySelector<HTMLElement>(".hero__orbs");
  if (!orbsWrap) return;

  if (reduced) return;

  gsap.registerPlugin(ScrollTrigger);

  const a = orbsWrap.querySelector<HTMLElement>(".hero__orb--a");
  const b = orbsWrap.querySelector<HTMLElement>(".hero__orb--b");
  const c = orbsWrap.querySelector<HTMLElement>(".hero__orb--c");

  if (a) gsap.to(a, { x: 40, y: -30, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1 });
  if (b) gsap.to(b, { x: -60, y: 40, scale: 1.05, duration: 18, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
  if (c) gsap.to(c, { x: 30, y: -20, duration: 12, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 });

  // gentle parallax — orbs drift upward as the hero leaves the viewport
  gsap.to(orbsWrap, {
    yPercent: -30,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup, { once: true });
} else {
  setup();
}
