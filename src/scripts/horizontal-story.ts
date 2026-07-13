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
      const productPreview = story.querySelector<HTMLElement>(".story__product-preview");
      const productIndex = panels.findIndex((panel) => panel.dataset.storyPanel === "write");
      const workflowIndex = panels.findIndex((panel) => panel.dataset.storyPanel === "workflow");
      const workflowSteps = workflowIndex >= 0
        ? Array.from(panels[workflowIndex].querySelectorAll<HTMLElement>(".story__steps li"))
        : [];
      const ctaIndex = panels.findIndex((panel) => panel.dataset.storyPanel === "download");
      const ctaTitle = ctaIndex >= 0
        ? panels[ctaIndex].querySelector<HTMLElement>("#story-download-title")
        : null;
      const ctaWord = ctaTitle?.querySelector<HTMLElement>(".story__cta-word") ?? null;
      const ctaActions = ctaIndex >= 0
        ? panels[ctaIndex].querySelector<HTMLElement>(".story__actions")
        : null;

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
          const digits = String(Math.max(0, Math.floor(target))).length;
          const floor = digits > 1 ? 10 ** (digits - 1) : 0;
          const ceiling = 10 ** digits;
          const spinValue = () => Math.floor(floor + Math.random() * (ceiling - floor));

          counter.classList.add("is-rolling");
          gsap.to({}, {
            duration: 0.46,
            ease: "none",
            onStart: () => { counter.textContent = spinValue().toLocaleString(); },
            onUpdate: () => { counter.textContent = spinValue().toLocaleString(); },
            onComplete: () => {
              const state = { value: Math.round(target * 0.58) };
              gsap.to(state, {
                value: target,
                duration: 0.72,
                ease: "power3.out",
                onUpdate: () => { counter.textContent = Math.round(state.value).toLocaleString(); },
                onComplete: () => {
                  counter.textContent = target.toLocaleString();
                  counter.classList.remove("is-rolling");
                },
              });
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
      const updateProductPreview = (progress: number) => {
        if (!productPreview || productIndex < 0) return;
        const centre = panelProgress(productIndex);
        // Start before the write panel reaches centre so the preview is already
        // arriving as the panel enters the viewport, not halfway through it.
        const reveal = gsap.utils.clamp(0, 1, (progress - (centre - 0.35)) / 0.3);
        const dropDistance = Math.min(pin.clientHeight * 0.52, 460);
        gsap.set(productPreview, {
          y: gsap.utils.interpolate(-dropDistance, 0, reveal),
          autoAlpha: gsap.utils.interpolate(0.22, 1, reveal),
        });
      };
      const updateWorkflowSteps = (progress: number) => {
        if (workflowIndex < 0 || workflowSteps.length === 0) return;
        const centre = panelProgress(workflowIndex);
        const sceneReveal = gsap.utils.clamp(0, 1, (progress - (centre - 0.34)) / 0.36);

        workflowSteps.forEach((step, index) => {
          const reveal = gsap.utils.clamp(0, 1, (sceneReveal - index * 0.16) / 0.48);
          gsap.set(step, {
            y: gsap.utils.interpolate(76, 0, reveal),
            rotation: gsap.utils.interpolate(index === 1 ? -2 : 2, 0, reveal),
            autoAlpha: gsap.utils.interpolate(0.12, 1, reveal),
          });
        });
      };
      const updateCta = (progress: number) => {
        if (ctaIndex < 0 || !ctaTitle) return;
        const centre = panelProgress(ctaIndex);
        const reveal = gsap.utils.clamp(0, 1, (progress - (centre - 0.32)) / 0.32);
        gsap.set(ctaTitle, {
          y: gsap.utils.interpolate(58, 0, reveal),
          autoAlpha: reveal,
        });
        if (ctaActions) {
          const actionsReveal = gsap.utils.clamp(0, 1, (reveal - 0.34) / 0.56);
          gsap.set(ctaActions, {
            y: gsap.utils.interpolate(24, 0, actionsReveal),
            autoAlpha: actionsReveal,
          });
        }
        if (ctaWord) ctaWord.style.setProperty("--story-word-reveal", String(reveal));
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
        if (productPreview) story.classList.add("has-product-drop");
        if (workflowSteps.length > 0) story.classList.add("has-workflow-rise");
        if (ctaTitle) story.classList.add("has-cta-reveal");

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
            onRefresh: (self) => {
              updateProductPreview(self.progress);
              updateWorkflowSteps(self.progress);
              updateCta(self.progress);
              setActive(self.progress, self.direction || 1);
            },
            onUpdate: (self) => {
              updateProductPreview(self.progress);
              updateWorkflowSteps(self.progress);
              updateCta(self.progress);
              setActive(self.progress, self.direction || 1);
            },
          },
        });
        trigger = tween.scrollTrigger;
        updateProductPreview(trigger?.progress ?? 0);
        updateWorkflowSteps(trigger?.progress ?? 0);
        updateCta(trigger?.progress ?? 0);
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
        if (productPreview) gsap.set(productPreview, { clearProps: "opacity,transform" });
        workflowSteps.forEach((step) => gsap.set(step, { clearProps: "opacity,transform" }));
        if (ctaTitle) gsap.set(ctaTitle, { clearProps: "opacity,transform" });
        if (ctaActions) gsap.set(ctaActions, { clearProps: "opacity,transform" });
        if (ctaWord) ctaWord.style.removeProperty("--story-word-reveal");
        story.classList.remove("has-product-drop");
        story.classList.remove("has-workflow-rise");
        story.classList.remove("has-cta-reveal");
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
