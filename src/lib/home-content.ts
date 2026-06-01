export const repoUrl = "https://github.com/mattenarle10/markamd";

export const features = [
  {
    title: "context tray",
    body: "stage multiple markdown files from the sidebar, track file/token counts, and copy one AI-ready bundle with relative paths.",
  },
  {
    title: "IDE-style sidebar",
    body: "drag files between folders. right-click for rename, new file, new folder. ⌘⌥Z to undo. your context library, organized like a project.",
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

export const steps = [
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

export const featured: { name: string; meta: string; href: string }[] = [
  {
    name: "AlternativeTo",
    meta: "5★ user review",
    href: "https://alternativeto.net/software/marka-md/",
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
    name: "awesome-markdown-editors",
    meta: "merged",
    href: "https://github.com/mundimark/awesome-markdown-editors",
  },
];

export const shortcuts: { key: string; label: string }[] = [
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

export const themeFamilies = [
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
    title: "tabs, languages, cleaner packages.",
    body: "v1.5 started with the context tray. v1.5.3 rounds it out with file tabs, more interface languages, grouped themes, and cleaner app naming.",
    items: [
      {
        label: "file tabs",
        body: "keep multiple notes open and switch context without losing your place.",
      },
      {
        label: "more languages",
        body: "the interface now covers a wider set of languages with a cleaner selector.",
      },
      {
        label: "app naming",
        body: "packaged builds now line up around the marka.md name across release artifacts.",
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
