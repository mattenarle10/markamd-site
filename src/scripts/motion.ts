// shared singleton motion runtime.
// imported once by Layout.astro — sets up Lenis smooth scroll, registers
// ScrollTrigger, and hooks Lenis's RAF into gsap.ticker so all scroll-driven
// timelines read the smoothed scroll position. respects prefers-reduced-motion.

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __markamdMotionInit?: boolean;
    __lenis?: Lenis;
  }
}

function init() {
  if (typeof window === "undefined") return;
  if (window.__markamdMotionInit) return;
  window.__markamdMotionInit = true;

  // accessibility: bail if user prefers reduced motion
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    gsap.registerPlugin(ScrollTrigger);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    gestureOrientation: "vertical",
    smoothWheel: true,
  });
  window.__lenis = lenis;

  // pipe Lenis frames into gsap so ScrollTrigger reads the smoothed position
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
