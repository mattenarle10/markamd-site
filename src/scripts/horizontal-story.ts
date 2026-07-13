// Desktop-only horizontal story controller. The markup remains a normal list of
// linked sections, so small screens and reduced-motion users keep a plain,
// readable vertical document.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const DESKTOP_QUERY = "(min-width: 768px)";
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
const MIN_DISTANCE = 1;

function setup() {
  const story = document.querySelector<HTMLElement>(".story");
  const pin = document.querySelector<HTMLElement>(".story__pin");
  const track = document.querySelector<HTMLElement>(".story__track");
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".story__progress-link"));

  if (!story || !pin || !track) return;

  gsap.registerPlugin(ScrollTrigger);

  const media = gsap.matchMedia();
  media.add(
    { desktop: DESKTOP_QUERY, motion: MOTION_QUERY },
    (context) => {
      if (!context.conditions?.desktop || !context.conditions.motion) return;

      const panels = Array.from(track.querySelectorAll<HTMLElement>(".story__panel"));
      if (panels.length === 0) return;

      let disposed = false;
      let initialized = false;
      let activeIndex = -1;
      let refreshTimer: number | undefined;
      let retryFrame: number | undefined;
      let retryTimer: number | undefined;
      let stableFrames = 0;
      let lastMeasurement = "";
      let tween: gsap.core.Tween | undefined;
      let trigger: ScrollTrigger | undefined;
      let countersPlayed = false;
      const faqItems = Array.from(story.querySelectorAll<HTMLDetailsElement>(".story__faq details"));

      const playCounters = () => {
        if (countersPlayed) return;
        countersPlayed = true;
        story.querySelectorAll<HTMLElement>("[data-count]").forEach((counter) => {
          const target = Number((counter.dataset.count ?? "0").replaceAll(",", ""));
          if (!Number.isFinite(target)) return;
          const state = { value: 0 };
          gsap.to(state, {
            value: target,
            duration: 1.15,
            ease: "power2.out",
            onUpdate: () => {
              counter.textContent = Math.round(state.value).toLocaleString();
            },
          });
        });
      };

      const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth);
      const hasUsableLayout = () => {
        const width = pin.clientWidth;
        const overflow = distance();

        // During initial paint (and sometimes during a breakpoint transition),
        // the desktop flex rule has not been measured yet. Starting a pin at
        // that point creates a zero-length ScrollTrigger and a brief vertical
        // stack. Wait until every full-screen panel has a real desktop width.
        return width > 0
          && overflow > MIN_DISTANCE
          && panels.every((panel) => panel.getBoundingClientRect().width >= width * 0.9);
      };
      const measurement = () => `${pin.clientWidth}:${track.scrollWidth}:${panels.map((panel) => Math.round(panel.getBoundingClientRect().width)).join(",")}`;

      const panelProgress = (index: number) => {
        const maxDistance = distance();
        if (maxDistance === 0) return 0;

        const centre = panels[index].offsetLeft + panels[index].offsetWidth / 2;
        return gsap.utils.clamp(0, 1, (centre - pin.clientWidth / 2) / maxDistance);
      };
      const setActive = (progress: number, direction = 1) => {
        let next = panels.length - 1;
        for (let index = 0; index < panels.length - 1; index += 1) {
          const boundary = (panelProgress(index) + panelProgress(index + 1)) / 2;
          if (progress < boundary || (progress === boundary && direction < 0)) {
            next = index;
            break;
          }
        }
        if (next === activeIndex) return;
        activeIndex = next;

        links.forEach((link, index) => {
          const active = index === next;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "step");
          else link.removeAttribute("aria-current");
        });
        if (panels[next].dataset.storyPanel === "proof") playCounters();
      };

      const scheduleRefresh = () => {
        if (disposed) return;
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => {
          if (initialized) ScrollTrigger.refresh();
          else scheduleAttempt();
        }, 100);
      };

      const start = () => {
        if (disposed || initialized) return;
        initialized = true;

        tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top top",
            end: () => `+=${Math.max(MIN_DISTANCE, distance())}`,
            pin,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: (self) => setActive(self.progress, self.direction || 1),
            onUpdate: (self) => setActive(self.progress, self.direction || 1),
          },
        });
        trigger = tween.scrollTrigger;
        setActive(trigger?.progress ?? 0);
        ScrollTrigger.refresh();
      };

      const attempt = () => {
        retryFrame = undefined;
        if (disposed || initialized) return;

        if (!hasUsableLayout()) {
          stableFrames = 0;
          retryTimer = window.setTimeout(scheduleAttempt, 80);
          return;
        }

        const nextMeasurement = measurement();
        stableFrames = nextMeasurement === lastMeasurement ? stableFrames + 1 : 0;
        lastMeasurement = nextMeasurement;

        // Two matching animation frames avoids pinning between CSS layout and
        // late font/image sizing, while keeping the first interaction snappy.
        if (stableFrames >= 2) start();
        else scheduleAttempt();
      };
      const scheduleAttempt = () => {
        if (disposed || initialized || retryFrame !== undefined) return;
        retryFrame = window.requestAnimationFrame(attempt);
      };

      const onProgressClick = (event: MouseEvent) => {
        const link = event.currentTarget as HTMLAnchorElement;
        const index = links.indexOf(link);
        if (index < 0 || !trigger) return;
        event.preventDefault();
        trigger.scroll(trigger.start + (trigger.end - trigger.start) * panelProgress(index));
      };
      const onFaqToggle = (event: Event) => {
        const opened = event.currentTarget as HTMLDetailsElement;
        if (!opened.open) return;
        faqItems.forEach((item) => {
          if (item !== opened) item.open = false;
        });
      };
      links.forEach((link) => link.addEventListener("click", onProgressClick));
      faqItems.forEach((item) => item.addEventListener("toggle", onFaqToggle));

      const observer = new ResizeObserver(scheduleRefresh);
      observer.observe(pin);
      observer.observe(track);

      const onLoad = () => scheduleRefresh();
      window.addEventListener("load", onLoad, { once: true });
      window.addEventListener("pageshow", onLoad);

      // Fonts and image decodes can change the story's measured width after
      // DOMContentLoaded. They only request a refresh; they never create a
      // second trigger.
      const waitForImage = async (image: HTMLImageElement): Promise<void> => {
        if (image.complete) {
          try {
            await image.decode?.();
          } catch {
            // A failed decorative image should not block the story layout.
          }
          return;
        }
        await new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      };
      const imageReady = Array.from(story.querySelectorAll<HTMLImageElement>("img")).map(waitForImage);
      void Promise.all(imageReady).then(scheduleRefresh);
      void document.fonts?.ready.then(scheduleRefresh);

      scheduleAttempt();

      return () => {
        disposed = true;
        window.clearTimeout(refreshTimer);
        window.clearTimeout(retryTimer);
        if (retryFrame !== undefined) window.cancelAnimationFrame(retryFrame);
        observer.disconnect();
        window.removeEventListener("load", onLoad);
        window.removeEventListener("pageshow", onLoad);
        links.forEach((link) => link.removeEventListener("click", onProgressClick));
        faqItems.forEach((item) => item.removeEventListener("toggle", onFaqToggle));
        trigger?.kill(true);
        tween?.kill();
        gsap.set(track, { clearProps: "transform" });
        links.forEach((link) => {
          link.classList.remove("is-active");
          link.removeAttribute("aria-current");
        });
      };
    },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup, { once: true });
} else {
  setup();
}
