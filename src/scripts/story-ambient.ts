// The CSS layer is complete without this enhancement. Pointer movement only
// adds a tiny shared drift, keeping the story calm and avoiding a render loop.
function setupStoryAmbient() {
  const ambient = document.querySelector<HTMLElement>("[data-story-ambient]");
  const story = ambient?.closest<HTMLElement>("[data-story]");
  if (!ambient || !story) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");
  const desktopQuery = window.matchMedia("(min-width: 900px)");
  if (!motionQuery.matches || !desktopQuery.matches) return;

  let frame = 0;
  let x = 0;
  let y = 0;

  const render = () => {
    frame = 0;
    ambient.style.setProperty("--story-ambient-x", x.toFixed(2));
    ambient.style.setProperty("--story-ambient-y", y.toFixed(2));
  };

  const onPointerMove = (event: PointerEvent) => {
    const bounds = story.getBoundingClientRect();
    x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 26;
    y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 26;
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  const reset = () => {
    x = 0;
    y = 0;
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  story.addEventListener("pointermove", onPointerMove, { passive: true });
  story.addEventListener("pointerleave", reset, { passive: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupStoryAmbient, { once: true });
} else {
  setupStoryAmbient();
}
