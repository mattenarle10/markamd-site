// Homepage-only browser behavior: nav border, copy affordances, platform labels,
// and the multi-platform download menu.

const nav = document.querySelector(".nav");
if (nav) {
  const onScroll = () => {
    if (window.scrollY > 8) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy ?? "";
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add("is-copied");
      window.setTimeout(() => btn.classList.remove("is-copied"), 1400);
    } catch (err) {
      console.error("[markamd-site] clipboard write failed", err);
    }
  });
});

if (/Windows/i.test(navigator.userAgent)) {
  const swap = (el: Element) => {
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const t = node.textContent;
        if (/⌘|⌥|⇧/.test(t)) {
          node.textContent = t
            .replace(/⌘\s*⇧\s*/g, "Ctrl+Shift+")
            .replace(/⌘\s*⌥\s*/g, "Ctrl+Alt+")
            .replace(/⌘\s*/g, "Ctrl+")
            .replace(/⌥\s*/g, "Alt+")
            .replace(/⇧\s*/g, "Shift+");
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        swap(node as Element);
      }
    });
  };
  swap(document.body);
}

(() => {
  const dl = document.querySelector<HTMLElement>("[data-dl]");
  if (!dl) return;

  const primary = dl.querySelector<HTMLAnchorElement>("[data-dl-primary]");
  const toggle = dl.querySelector<HTMLButtonElement>("[data-dl-toggle]");
  const menu = dl.querySelector<HTMLElement>("[data-dl-menu]");
  if (!primary || !toggle || !menu) return;

  const rows = Array.from(menu.querySelectorAll<HTMLAnchorElement>(".dl__row"));
  const ua = navigator.userAgent;
  const winHref = dl.dataset.windows ?? "";
  const linuxHref = dl.dataset.linux ?? "";

  let chosen: "mac" | "windows" | "linux" = "mac";
  if (/Windows/i.test(ua) && winHref) chosen = "windows";
  else if (/Linux/i.test(ua) && linuxHref) chosen = "linux";
  else if (/Mac|iPhone|iPad|iPod/i.test(ua)) chosen = "mac";

  dl.dataset.os = chosen;

  if (chosen === "windows" && winHref) {
    primary.href = winHref;
    primary.setAttribute("aria-label", "download for Windows");
  } else if (chosen === "linux" && linuxHref) {
    primary.href = linuxHref;
    primary.setAttribute("aria-label", "download for Linux");
  }

  const primaryRow = menu.querySelector<HTMLAnchorElement>(`[data-dl-row="${chosen}"]`);
  if (primaryRow) primaryRow.dataset.active = "true";

  const setOpen = (open: boolean) => {
    dl.dataset.open = String(open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      window.requestAnimationFrame(() => {
        const target =
          menu.querySelector<HTMLAnchorElement>('.dl__row[data-active="true"]:not(.dl__row--soon)') ??
          rows.find((r) => !r.classList.contains("dl__row--soon"));
        target?.focus();
      });
    }
  };
  const isOpen = () => dl.dataset.open === "true";

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!isOpen());
  });

  document.addEventListener("click", (e) => {
    if (!dl.contains(e.target as Node)) setOpen(false);
  });

  dl.addEventListener("keydown", (e) => {
    const focusables = rows.filter((r) => !r.classList.contains("dl__row--soon"));
    const currentIdx = focusables.findIndex((r) => r === document.activeElement);

    if (e.key === "Escape") {
      setOpen(false);
      toggle.focus();
      return;
    }
    if (!isOpen() && (e.key === "ArrowDown" || e.key === "Enter") && e.target === toggle) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!isOpen()) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = focusables[(currentIdx + 1 + focusables.length) % focusables.length];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = focusables[(currentIdx - 1 + focusables.length) % focusables.length];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      focusables[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      focusables[focusables.length - 1]?.focus();
    }
  });
})();
