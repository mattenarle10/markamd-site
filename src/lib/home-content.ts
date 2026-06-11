import type { FeaturedLink, Feature, Shortcut, Step, ThemeFamily } from "./home-types";

export const repoUrl = "https://github.com/mattenarle10/markamd";

export const features: Feature[] = [
  {
    title: "context tray",
    body: "stage markdown files from one folder or many, track file/token counts, and copy one AI-ready bundle with relative paths.",
  },
  {
    title: "multi-folder explorer",
    body: "open multiple roots, keep each folder separated, pin favorites, and drag files between folders. your context library, organized like a project.",
  },
  {
    title: "live preview",
    body: "edit on the left, watch markdown render on the right. mermaid + shiki, all live.",
  },
  {
    title: "reading mode + editor-only",
    body: "⌘. for a calm preview-only view (great for proofing). ⌘⇧. for editor-only when you just want to write. mirror modes, mutually exclusive.",
  },
  {
    title: "share with ai",
    body: "copy the current file as clean markdown, or stage several files and copy one context bundle. paste into claude, chatgpt, gemini, your local agent — anywhere that reads text.",
  },
  {
    title: "open as text",
    body: "peek into safe plain-text files beside your markdown notes. useful for prompts, configs, logs, and mixed project folders.",
  },
  {
    title: "vim mode (opt-in)",
    body: "toggle from the theme menu. NORMAL/INSERT/VISUAL/REPLACE pill in the status bar. hjkl, dd, yy, : command bar — full vim defaults via @replit/codemirror-vim. lazy-loaded so non-vim users don't pay the ~200KB cost.",
  },
  {
    title: "find · undo · all keyboard",
    body: "⌘F find/replace, ⌘⌥Z undo file ops, ⌘K command palette grouped by category. grouped themes too — mono, catppuccin, crafted palettes, and AI-inspired Claude / Codex / Gemini / Cursor.",
  },
  {
    title: "stays local",
    body: "your notes never leave your machine. no telemetry, no cloud, no account. just files.",
  },
  {
    title: "lean & lazy",
    body: "~240 MB resident on macOS. shiki themes + 36 langs lazy-loaded only when you actually hit them. mermaid only loads when a doc has a diagram. tauri 2 + native webview, zero electron bloat.",
  },
];

export const steps: Step[] = [
  {
    n: "01",
    art: "/mascot/notebook.png",
    title: "collect",
    body: "open a folder of markdown notes. that's your context library.",
  },
  {
    n: "02",
    art: "/mascot/pen.png",
    title: "write",
    body: "edit side-by-side with live preview. save when ready.",
  },
  {
    n: "03",
    art: "/mascot/excite.png",
    title: "share",
    body: "copy one file, or stage many notes into a context bundle. paste into claude.",
  },
];

export const featured: FeaturedLink[] = [
  {
    name: "AlternativeTo",
    meta: "5★ user review",
    href: "https://alternativeto.net/software/marka-md/about/",
  },
  {
    name: "kachibito.net",
    meta: "featured 🇯🇵",
    href: "https://kachibito.net/useful-resource/marka-md",
  },
  {
    name: "LinuxEasy",
    meta: "Italian feature",
    href: "https://www.linuxeasy.org/marka-md-editor-markdown-minimale-intelligenza-artificiale/",
  },
  {
    name: "Markdown Handbook",
    meta: "editor roundup",
    href: "https://md-handbook.com/blog/markdown-link-no-36/",
  },
  {
    name: "Web Apps Magazine",
    meta: "Italian review",
    href: "https://webappsmagazine.blogspot.com/2026/06/markamd-leditor-markdown-minimalista-e.html",
  },
  {
    name: "awesome-markdown-editors",
    meta: "merged",
    href: "https://github.com/mundimark/awesome-markdown-editors",
  },
];

export const shortcuts: Shortcut[] = [
  { key: "⌘K", label: "command palette" },
  { key: "⌘⇧O", label: "open folder" },
  { key: "⌘ click", label: "stage context" },
  { key: "⌘S", label: "save" },
  { key: "⌘⇧S", label: "save as" },
  { key: "⌘.", label: "reading mode" },
  { key: "⌘⇧.", label: "editor-only" },
  { key: "⌘⇧C", label: "copy markdown" },
  { key: "⌘B", label: "toggle sidebar" },
  { key: "⌘/", label: "help" },
];

export const themeFamilies: ThemeFamily[] = [
  {
    name: "neutral",
    sub: "system + mono",
    note: "quiet black/white modes for plain writing.",
    swatches: [
      ["#ffffff", "#e2722e"],
      ["#f7f7f4", "#171717"],
      ["#111111", "#f8f8f2"],
    ],
  },
  {
    name: "catppuccin",
    sub: "latte → mocha",
    note: "soft pastel ramp when you want the familiar catppuccin feel.",
    swatches: [
      ["#eff1f5", "#1e66f5"],
      ["#303446", "#ca9ee6"],
      ["#24273a", "#f5bde6"],
      ["#1e1e2e", "#cba6f7"],
    ],
  },
  {
    name: "ai",
    sub: "claude · codex · gemini · cursor",
    note: "brand-inspired palettes for the tools your notes usually end up in.",
    swatches: [
      ["#fbf7f0", "#cc785c"],
      ["#0f1115", "#10a37f"],
      ["#f7f9ff", "#5f6bff"],
      ["#fbfaf7", "#111111"],
    ],
  },
  {
    name: "crafted",
    sub: "matcha · kanagawa · rose pine · ayu",
    note: "handpicked writing moods for longer sessions.",
    swatches: [
      ["#f7f4e9", "#7b9a4e"],
      ["#1f1f28", "#7e9cd8"],
      ["#191724", "#ebbcba"],
      ["#1f2430", "#ffa759"],
    ],
  },
];

const releaseHighlightsByMinor = {
  "1.5": {
    eyebrow: "v1.5 release",
    title: "preview and file switching feel tighter.",
    body: "The latest v1.5 update keeps the workspace loop smoother: browser-safe preview links, steadier selection sync, remembered scroll positions, and cleaner sidebar scrolling. v1.5.9 closes 3 issues, with 12 closed across the v1.5 cycle so far.",
    items: [
      {
        label: "preview links",
        body: "http and https links in rendered markdown now open in your browser.",
      },
      {
        label: "scroll memory",
        body: "switch files without losing your editor and preview position.",
      },
      {
        label: "selection sync",
        body: "text selections use source-line hints for more reliable editor and preview matching.",
      },
      {
        label: "community loop",
        body: "shipped with contributor PRs and feedback from people testing the app in the wild.",
      },
    ],
  },
};

export function getReleaseHighlight(version: string) {
  const currentRelease = version.replace(/^v/, "");
  const currentMinor = currentRelease.split(".").slice(0, 2).join(".");
  const highlight = releaseHighlightsByMinor[currentMinor as keyof typeof releaseHighlightsByMinor];

  if (highlight) {
    return {
      ...highlight,
      eyebrow: currentMinor === "1.5" ? version : highlight.eyebrow,
    };
  }

  return {
    eyebrow: "latest release",
    title: "new in marka.md.",
    body: "the newest release keeps the local-first markdown workflow focused, fast, and ready for AI context handoff.",
    items: [
      {
        label: "release notes",
        body: "read the changelog for the newest fixes, features, and release details.",
      },
    ],
  };
}
